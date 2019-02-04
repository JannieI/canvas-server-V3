// Router for All Canvas (application-specific) data routes

// Imports
const express = require('express');
const router = express.Router();
const config = require('config');
const debugDev = require('debug')('app:dev');
const createErrorObject = require('../utils/createErrorObject.util');
const createReturnObject = require('../utils/createReturnObject.util');
const sortFilterFieldsAggregate = require('../utils/sortFilterFieldsAggregate.util');

// Note: for now, cache has NO DATA on startup, and is only filled the first time data is read from
//       the DB.  Subsequently, the data is provided from cache until it is not fresh any longer (past
//       the expiry data), at which point it is read from the DB again.
//       When the data is updated (PUT or POST), the cache is updated in sync
//       TODO - consider if we should not read the whole cache from DB after an update?


// NB to Ivan
// BIG TODO note - I havent changed the cache with updates - it is messy in JS and we will rewrite
//                 in any case in TS, probably improving it as well.
//

var moduleName = '';

// Caching Variables
const dataCachingTableVariable = require('../utils/dataCachingTableMemory.util');  // Var loaded at startup
var dataCachingTableArray = null;   // Local copy of dataCachingTable - STRUCTURE
var serverCacheableMemory;          // True if the current resource is cached - CURRENT VAR
var serverVariableName;             // Name in serverMemoryCache to store data for the current resource: cahced here - CURRENT VAR
var isFresh;                        // True if the cache for the current resource is fresh (not expired) - CURRENT VAR

// Variable to store the cached DATA.  Startup values are null.
// TODO - expand to ALL resources, or do differently ...
var serverMemoryCache = {
    dashboards: null,               // Corresponds to serverVariableName in dataCachingTable, holds DATA
    datasources: null,

    get: function(varName) {
        if (varName == 'dashboards') {
            return serverMemoryCache.dashboards;
        };
        if (varName == 'datasources') {
            return serverMemoryCache.datasources;
        };
        return [];
    },
    set: function(varName, input) {
        if (varName == 'dashboards') {
            serverMemoryCache.dashboards = input;
        };
        if (varName == 'datasources') {
            serverMemoryCache.datasources = input;
        };
    }
};

// Validate route
function validateRoute(route) {

    // TODO -validate resource = real route, ie dashboars, widgets, etc

    // Return error; null means NO errors found
    let error = null;

    if (route == null  ||  route == ''  ||  route.length < 3) {
        return 'The route of min length 3 is compulsory';
    };

    const validRoutes = config.get('validRoutes')
    let routesIndex = validRoutes.indexOf(route);
    if (routesIndex < 0) {
        let possibleMatches = validRoutes.filter(r => r.indexOf(route) >= 0).toString();
        error = 'Route ' + route + ' not in our Configuration file.  Did you mean: ' + possibleMatches;
    };

    // Return
    return error;
}

// Dates in JS is Difficult.Very !!
// See: https://stackoverflow.com/questions/1197928/how-to-add-30-minutes-to-a-javascript-date-object
// * @param interval  One of: year, quarter, month, week, day, hour, minute, second
// * @param units  Number of units of the given interval to add.
// */
function dateAdd(date, interval, units) {
    var ret = new Date(date); //don't change original date
    var checkRollover = function() { if(ret.getDate() != date.getDate()) ret.setDate(0);};
    switch(interval.toLowerCase()) {
        case 'year'   :  ret.setFullYear(ret.getFullYear() + units); checkRollover();  break;
        case 'quarter':  ret.setMonth(ret.getMonth() + 3*units); checkRollover();  break;
        case 'month'  :  ret.setMonth(ret.getMonth() + units); checkRollover();  break;
        case 'week'   :  ret.setDate(ret.getDate() + 7*units);  break;
        case 'day'    :  ret.setDate(ret.getDate() + units);  break;
        case 'hour'   :  ret.setTime(ret.getTime() + units*3600000);  break;
        case 'minute' :  ret.setTime(ret.getTime() + units*60000);  break;
        case 'second' :  ret.setTime(ret.getTime() + units*1000);  break;
        default       :  ret = undefined;  break;
    }
    return ret;
}

// TODO - this whole thing is much easier in TS methinks
// Initial load of dataCaching table STRUCTURE from global variable
function initialLoadOfCachingTable () {
    debugDev(moduleName + ": " + 'Initialise dataCachingTableArray ...')
    dataCachingTableArray = dataCachingTableVariable.get();

    // Reset the serverExpiryDateTime to now.  This is used to determine if the DATA is fresh,
    // ie should be reloaded from the DB after the expiry data
    let dn = new Date();
    let tn = dn.getTime()
    for (var i = 0; i < dataCachingTableArray.length; i++) {
        dataCachingTableArray[i].serverExpiryDateTime = tn;
    };

    // Safeguard
    if (dataCachingTableArray == null) {
        dataCachingTableArray = [];
    };
}

// Runs for ALL requests
router.use('/:resource', (req, res, next) => {

    const startPos = module.id.lastIndexOf("/");
    if (startPos > 0  &&  startPos < module.id.length) {
        moduleName = module.id.substring(startPos + 1);
    };

    // Validate Params
    if (!req.params) {
        return res.status(400).json({
            "statusCode": "error",
            "message" : "Error: Resource not provided",
            "data": null,
            "error": "Error: Resource not provided"
        });
        return;
    };

    // Validate resource (route)
    let resource;
    if (req.params.resource.substr(0, 1) === ':') {
        resource = req.params.resource.substr(1);
    } else {
        resource = req.params.resource;
    };

    const error = validateRoute(resource);

    if (error) {
        return res.status(400).json({
            "statusCode": "error",
            "message" : error,
            "data": null,
            "error": error
        });

        return;
    };

    // Continue
    next();
})

// GET route
router.get('/:resource', (req, res, next) => {

    // Extract: query, route (params without the :) and validate
    let resource;
    if (req.params.resource.substr(0, 1) === ':') {
        resource = req.params.resource.substr(1);
    } else {
        resource = req.params.resource;
    };
    const query = req.query;
    const id = query.id;

    debugDev(moduleName + ": " + '## --------------------------');
    debugDev(moduleName + ": " + '## GET Starting with resource:', resource, ', query:', query);

    // Load global variable for cachingTable STRUCTURE into an Array ONCE
    if (dataCachingTableArray == null) {
        initialLoadOfCachingTable();
    };

    // Single instance (row) in cachingTable for current resource
    let serverDataCachingTable = null;

    // TODO - use findIndex in TS
    // Loop on cachingTableArray
    for (var i = 0; i < dataCachingTableArray.length; i++) {

        serverDataCachingTable = dataCachingTableArray[i];

        // Find the single instance (row) for current resource.
        // If the key is there, it uses caching
        if (serverDataCachingTable.key == resource) {

            // Extract info into local variables
            serverCacheableMemory = serverDataCachingTable.serverCacheableMemory;
            serverVariableName = serverDataCachingTable.serverVariableName;

            // The resource is cached on the server: it has a valid server variable, and is marked True
            if (serverCacheableMemory  &&  serverVariableName != null) {

                // Check if fresh (not expired).  The first time it will be expired by design.
                let dn = new Date();
                let tn = dn.getTime()
                let dl = new Date(serverDataCachingTable.serverExpiryDateTime);
                let tl = dl.getTime();
                if (tl > tn) {
                    isFresh = true;
                } else {
                    isFresh = false;
                };

                // If cache is fresh, and DATA already loaded in cache
                if (isFresh  &&  serverMemoryCache.get(serverVariableName) != null) {

                    // TODO - decide whether to fill the fields in the metaData
                    const fields = [];

                    let data = serverMemoryCache.get(serverVariableName);
                    debugDev(moduleName + ": " + 
                        '  Returned',
                        data.length,
                        'records from cache!'
                    );

                    // Extract the Widget specific data (sort, filter, fields, aggregate)
                    data =  sortFilterFieldsAggregate(data, query);
 
                    // Return if an Error
                    if (data.error) {
                        return res.status(400).json(
                            createErrorObject(
                                "error",
                                "Error in the sortFilterFieldsAggregate routine",
                                data.error
                            )
                        );
                    };

                    return res.json(
                        createReturnObject(
                            "success",
                            "Retrieved data for resource: " + resource,
                            data.results,
                            null,
                            null,
                            null,
                            null,
                            serverVariableName,
                            data.results.length,
                            fields,
                            null
                            )
                    );
                };
            };
        };
    };

    // Try, in case model file does not exist
    try {
        // Get the model dynamically (take note of file spelling = resource)
        const canvasSchema = '../models/' + resource + '.model';
        debugDev(moduleName + ": " + 'Using Model ', canvasSchema, serverCacheableMemory?  'with caching'  :  'WITHOUT cache')
        const canvasModel = require(canvasSchema);

        // Find ALL the data (using the standard query JSON object)
        // We want to cache all, and return filtered if query was supplied
        canvasModel.find( {}, (err, docs) => {

            // KEEP for later !
            // Extract metodata from the Schema, using one document
            // const oneDoc = canvasModel.findOne();

            // Load DATA into Cache if this resource is cached and not fresh.  Then set the expiryDateTime
            for (var i = 0; i < dataCachingTableArray.length; i++) {

                serverDataCachingTable = dataCachingTableArray[i];

                // Find the row and set the serverExpiryDateTime
                if (serverDataCachingTable.key == resource) {
                    serverCacheableMemory = serverDataCachingTable.serverCacheableMemory;
                    serverVariableName = serverDataCachingTable.serverVariableName;
                    if (serverCacheableMemory  &&  !isFresh  &&  serverVariableName != null) {
                        serverMemoryCache.set(serverVariableName, docs);

                        debugDev(moduleName + ": " + 
                            'Loaded',
                            serverMemoryCache.get(serverVariableName).length,
                            'records into cache for',
                            serverVariableName
                        );

                        // TODO - fix hardcode
                        let dt = new Date();
                        let seconds = 86400;
                        if (serverDataCachingTable.localLifeSpan) {
                            seconds = +serverDataCachingTable.localLifeSpan;
                        };
                    serverDataCachingTable.serverExpiryDateTime = dateAdd(dt, 'second', 86400);
                    };
                };
            };

            let returnSet = sortFilterFieldsAggregate(docs, query);

            // Return if an Error
            if (returnSet.error) {
                return res.status(400).json(
                    createErrorObject(
                        "error",
                        "Error in the sortFilterFieldsAggregate routine",
                        returnSet.error
                    )
                );
            };

            // Empty Array of fields
            var fields = [];

            // KEEP for later !
            // TODO - make this work for all data
            // Loop on metatdata
            // for (var key in oneDoc.schema.obj) {
            //     var value = oneDoc.schema.obj[key];

            //     fields.push(
            //         {
            //             "fieldName": key,
            //             "fieldType": value.name,
            //             "average": null,
            //             "max": null,
            //             "median": null,
            //             "min": null,
            //             "sum": null
            //         }
            //     );
            // };

            // Return the data with metadata
            return res.json(
                createReturnObject(
                    "success",
                    "Retrieved data for resource: " + resource,
                    returnSet.results,
                    null,
                    null,
                    null,
                    null,
                    null,
                    returnSet.results.length,
                    fields,
                    null
                    )
            );
        });
    }
    catch (error) {
        debugDev(moduleName + ": " + 'Error: ', error)
        return res.status(400).json({
            "statusCode": "error",
            "message" : "No model file for resource: " + resource,
            "data": null,
            "error": error
        });
    };

})

// POST route
router.post('/:resource', (req, res, next) => {

    // Extract: body, route (params without :)
    let resource;
    if (req.params.resource.substr(0, 1) === ':') {
        resource = req.params.resource.substr(1);
    } else {
        resource = req.params.resource;
    };
    const body = req.body;
    debugDev(moduleName + ": " + 'Router: POST for resource:', resource)
    debugDev(moduleName + ": " + '');

    if (body == null) {
        return res.json(
            createErrorObject(
                "failed",
                "Error: no body provided for resource: " + resource,
                null
            )
        );
    };

    // Try, in case model file does not exist
    try {
        // Get the model dynamically (take note of file spelling = resource)
        const canvasSchema = '../models/' + resource + '.model';
        const canvasModel = require(canvasSchema);

        // Reset the expiryDateTime, so that the next read is from the DB (and not cache)
        let dataCachingTableIndex = dataCachingTableArray.findIndex(dc => dc.key == resource)
        if (dataCachingTableIndex >= 0) {
            dataCachingTableArray[dataCachingTableIndex].serverExpiryDateTime = new Date();
            debugDev(moduleName + ": " + 'Resource ' + resource + ' serverExpiryDateTime updated in Caching Table');
        } else {
            debugDev(moduleName + ": " + 'Resource ' + resource + ' record NOT IN CACHING TABLE');
        };

        // Create object and save to DB
        let canvasAdd = new canvasModel(body);
        canvasAdd.save()
            .then(doc => {
                debugDev(moduleName + ": " + 'New record added in canvasRouter')
                return res.json(
                    createReturnObject(
                        "success",
                        "Added record for resource: " + resource,
                        doc,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                    )
                );
            })
            .catch(err => {
                console.error(err)
                return res.json(
                    createErrorObject(
                        "error",
                        "Error: Could not add record for resource: " + resource,
                        err
                    )
                );
        });
    }
    catch (error) {
        return res.status(400).json({
            "statusCode": "error",
            "message" : "No model file for resource: " + resource,
            "data": null,
            "error": error
        });
    };

});

// DELETE route
router.delete('/:resource', (req, res, next) => {

    // Extract: body, route (params without :)
    let resource;
    if (req.params.resource.substr(0, 1) === ':') {
        resource = req.params.resource.substr(1);
    } else {
        resource = req.params.resource;
    };

    const query = req.query;
    const id = query.id;
    debugDev(moduleName + ": " + '.delete for ID: ', id);

    if (id == null) {
        return res.json(
            createErrorObject(
                "failed",
                "Error: no ID provided for resource: " + resource + 'id: ', id,
                null
            )
        );
    };

    // Try, in case model file does not exist
    try {
        // Get the model dynamically (take note of file spelling = resource)
        const canvasSchema = '../models/' + resource + '.model';
        const canvasModel = require(canvasSchema);

        // Find and Delete from DB
        canvasModel.findOneAndRemove({id: id})
            .then(doc => {
                debugDev(moduleName + ": " + resource + ' deleted ID: ' + id)

                if (doc == null) {
                    return res.json(
                        createReturnObject(
                            "success",
                            "Record not found for resource: " + resource + ', id: ', id,
                            doc,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            )
                    );
                } else {
                    return res.json(
                        createReturnObject(
                            "success",
                            "Deleted record for resource: " + resource + ', id: ', id,
                            doc,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            )
                    );
                };
            })
            .catch(err => {
                console.error(err)
                return res.json(
                    createErrorObject(
                        "error",
                        "Error: Could not delete record for resource: " + resource + ', id: ', id,
                        err
                    )
                );
            });
    }
    catch (error) {
        return res.status(400).json({
            "statusCode": "error",
            "message" : "No model file for resource: " + resource,
            "data": null,
            "error": error
        });
    };

});

// PUT route
router.put('/:resource', (req, res, next) => {

    // Extract: body, route (params without :)
    let resource;
    if (req.params.resource.substr(0, 1) === ':') {
        resource = req.params.resource.substr(1);
    } else {
        resource = req.params.resource;
    };
    const query = req.query;
    const body = req.body;

    const id = query.id;
    if (id == null) {
        return res.json(
            createErrorObject(
                "error",
                "Error: no ID provided for resource: " + resource + 'id: ', id,
                null
            )
        );
    };

    // Try, in case model file does not exist
    try {
        // Get the model dynamically (take note of file spelling = resource)
        const canvasSchema = '../models/' + resource + '.model';
        const canvasModel = require(canvasSchema);

        // Get Caching Table
        dataCachingTableArray = dataCachingTableVariable.get();

        // Safeguard
        if (dataCachingTableArray == null) {
            dataCachingTableArray = [];
        };

        // Reset the expiryDateTime, so that the next read is from the DB (and not cache)
        let dataCachingTableIndex = dataCachingTableArray.findIndex(dc => dc.key == resource)
        if (dataCachingTableIndex >= 0) {
            dataCachingTableArray[dataCachingTableIndex].serverExpiryDateTime = new Date();
            debugDev(moduleName + ": " + 'Resource ' + resource + ' serverExpiryDateTime updated in Caching Table');
        } else {
            debugDev(moduleName + ": " + 'Resource ' + resource + ' record NOT IN CACHING TABLE');
        };

        // Find and Update DB
        canvasModel.findOneAndUpdate(
            {id: id},
            body,
            {
              new: true,                       // return updated doc
              runValidators: true              // validate before update
            })
            .then(doc => {
                debugDev(moduleName + ": " + resource + ' updated ID: ' + id)
                return res.json(
                    createReturnObject(
                        "success",
                        "Updated record for resource: " + resource + 'id: ', id,
                        doc,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                    )
                );
            })
            .catch(err => {
                console.error(err)
                return res.json(
                    createErrorObject(
                        "error",
                        "Error: Could not update record for resource: " + resource + 'id: ', id,
                        err
                    )
                );
            });
    }
    catch (error) {
        return res.status(400).json({
            "statusCode": "error",
            "message" : "No model file for resource: " + resource,
            "data": null,
            "error": error
        });
    };

});

// Export
module.exports = router;