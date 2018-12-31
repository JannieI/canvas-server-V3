// Router for All Canvas (application-specific) data routes

// Imports
const express = require('express');
const passport = require('passport');
const router = express.Router();
const config = require('config');
const debugDev = require('debug')('app:dev');

// Caching Variables
const dataCachingTableVariable = require('../utils/dataCachingTableMemory');  // Var loaded at startup
let serverCacheableMemory;          // True if the current resource is cached
var serverVariableName;             // Variable name for the current resource - cahced here
var isFresh;                        // True if the cache for the current resource is fresh (not expired)
var dataCachingTableArray = null;   // Local copy of dataCachingTable

// Variable to store the cached value.  Startup values are null.
var serverMemoryCache = {
    dashboards: null,       // Corresponds to serverVariableName in dataCachingTable
    datasources: null,
   
    get: function(varName) {
        return serverMemoryCache.varName;
    },
    set: function(varName, input) {
        serverMemoryCache.varName = input;
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
        error = 'Route not in our Configuration file';
    };

    // Return
    return error;
}

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

// Initial load of dataCaching table
function initialLoadOfCachingTable () {
    debugDev('Initialise dataCachingTableArray ...')
    dataCachingTableArray = dataCachingTableVariable.get();

    // Reset the serverExpiryDateTime: 
    // - on the first request, load data from the DB
    // - subsequently, refresh it after expiry period 
    let dn = new Date();
    let tn = dn.getTime()
    for (var i = 0; i < dataCachingTableArray.length; i++) {
        dataCachingTableArray[i].serverExpiryDateTime = tn;
    };
}

// Runs for ALL requests
router.use('/:resource', (req, res, next) => {

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
    const resource = req.params.resource.substring(1);
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
    const resource = req.params.resource.substring(1);
    const query = req.query;

    debugDev('## --------------------------');
    debugDev('## GET Starting with resource:', resource, ', query:', query);

    // Load global variable for cachingTable into an Array ONCE
    if (dataCachingTableArray == null) {
        initialLoadOfCachingTable();
    //     debugDev('Initialise dataCachingTableArray ...')
    //     dataCachingTableArray = dataCachingTableVariable.get();

    //     // Reset the serverExpiryDateTime: 
    //     // - on the first request, load data from the DB
    //     // - subsequently, refresh it after expiry period 
    //     let dn = new Date();
    //     let tn = dn.getTime()
    //     for (var i = 0; i < dataCachingTableArray.length; i++) {
    //         dataCachingTableArray[i].serverExpiryDateTime = tn;
    //     };
    };
    
    // Assume worse case
    isFresh = false;

    // TODO - should be easier with TS
    // Single instance (row) in cachingTable for current resource
    let serverDataCachingTable = null;

    // TODO - use findIndex in TS
    // Loop on cachingTableArray
    for (var i = 0; i < dataCachingTableArray.length; i++) {

        // Find the single instance (row) for current resource: it uses caching
        if (dataCachingTableArray[i].key == resource) {

            // Extract info into variables
            serverDataCachingTable = dataCachingTableArray[i];
            serverCacheableMemory = serverDataCachingTable.serverCacheableMemory;
            serverVariableName = serverDataCachingTable.serverVariableName;
            
            // The table is cached on the server
            if (serverCacheableMemory) {

                // Check if fresh (not expired)
                let dn = new Date();
                let tn = dn.getTime()
                let dl = new Date(serverDataCachingTable.serverExpiryDateTime);
                let tl = dl.getTime();
                if (tl >= tn) {
                    isFresh = true;
                } else {
                    isFresh = false;
                };

                // Use server cache variable or table if fresh, AND something loaded in cache
                if (isFresh  &&  serverMemoryCache.get(serverVariableName) != null) {
                    if ( (serverVariableName != null)
                            &&
                            (serverVariableName.length != 0)
                        ) {
                            debugDev(
                                '  Return', 
                                serverMemoryCache.get(serverVariableName).length, 
                                'records from cache!'
                            );

                        // TODO - decide whether to fill the fields in the metaData
                        const fields = [];
                        return res.json({
                            "statusCode": "success",
                            "message" : "Retrieved data for resource: " + resource,
                            "data": serverMemoryCache.get(serverVariableName),
                            "metaData": {
                                "table": {
                                    "tableName": serverVariableName, //oneDoc.mongooseCollection.collectionName,
                                    "nrRecordsReturned":serverMemoryCache.get(serverVariableName).length
                                },
                                "fields": fields
                            },
                            "error": null
                        });
                        // return;
                    };
                };
            };

        };
    };

    // Try, in case model file does not exist
    try {
        // Get the model dynamically (take note of file spelling = resource)
        const canvasSchema = '../model/' + resource;
        debugDev('Using Model ', canvasSchema, serverCacheableMemory?  'with caching'  :  'WITHOUT cache')
        const canvasModel = require(canvasSchema);


        // Find the data (using the standard query JSON object)
        canvasModel.find( query, (err, docs) => {

            // KEEP for later !
            // Extract metodata from the Schema, using one document
            // const oneDoc = canvasModel.findOne();

            // Load Cache from data in DB
            if (serverCacheableMemory  &&  !isFresh) {
                serverMemoryCache.set(serverVariableName, docs)
                debugDev(
                    'Loaded', 
                    serverMemoryCache.get(serverVariableName).length, 
                    'records into cache for', 
                    serverVariableName
                );

                for (var i = 0; i < dataCachingTableArray.length; i++) {

                    // Find the row and set the serverExpiryDateTime
                    if (dataCachingTableArray[i].key == resource) {
                        let dt = new Date();
                        dataCachingTableArray[i].serverExpiryDateTime = dateAdd(dt, 'second', 86400);
                    };
                };
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

            // console.log('xx COUNT', fields, oneDoc.mongooseCollection.collectionName, docs.length)
            // Return the data with metadata
            return res.json({
                "statusCode": "success",
                "message" : "Retrieved data for resource: " + resource,
                "data": docs,
                "metaData": {
                    "table": {
                        "tableName": "", //oneDoc.mongooseCollection.collectionName,
                        "nrRecordsReturned":docs.length
                    },
                    "fields": fields
                },
                "error": null
            });
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

})

// POST route
router.post('/:resource', (req, res, next) => {

    // Extract: body, route (params without :)
    const resource = req.params.resource.substring(1);
    const body = req.body;
    debugDev('Router: POST for resource:', resource, 'body:', body)
    debugDev('');

    // Try, in case model file does not exist
    try {
        // Get the model dynamically (take note of file spelling = resource)
        const canvasSchema = '../model/' + resource;
        const canvasModel = require(canvasSchema);

        // Create object and save to DB
        let canvasAdd = new canvasModel(body);
        canvasAdd.save()
            .then(doc => {
                debugDev('saved', doc)
                return res.json({
                    "statusCode": "success",
                    "message" : "Added record for resource: " + resource,
                    "data": doc,
                    "error": null
                });
            })
            .catch(err => {
                console.error(err)
                return res.json({
                    "statusCode": "error",
                    "message" : "Error: Could not add record for resource: " + resource,
                    "data": null,
                    "error":
                        {
                            "errorObject": err
                        }
                });
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
    const resource = req.params.resource.substring(1);

    const query = req.query;
    const id = req.query.id;
    debugDev('const ',req.query, id);

    if (id == null) {
        return res.json({
            "statusCode": "failed",
            "message" : "Error: no ID provided for resource: " + resource + 'id: ', id,
            "data": null,
            "error": null
        });
    };

    // debugDev('Router: DELETE for resource:', resource, 'query:', query);
    // debugDev('');

    // Try, in case model file does not exist
    try {
        // Get the model dynamically (take note of file spelling = resource)
        const canvasSchema = '../model/' + resource;
        const canvasModel = require(canvasSchema);

        // Find and Delete from DB
        canvasModel.findOneAndRemove({id: id})
            .then(doc => {
                debugDev('deleted', doc)

                if (doc == null) {
                    return res.json({
                        "statusCode": "error",
                        "message" : "Deletion of " + resource + " failed: could not find id = " + id,
                        "data": doc,
                        "error": null
                    });
                } else {
                    return res.json({
                        "statusCode": "success",
                        "message" : "Deleted record for resource: " + resource + ', id: ', id,
                        "data": doc,
                        "error": null
                    });
                };
            })
            .catch(err => {
                console.error(err)
                return res.json({
                    "statusCode": "error",
                    "message" : "Error: Could not delete record for resource: " + resource + ', id: ', id,
                    "data": null,
                    "error":
                        {
                            "errorObject": err
                        }
                });
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
    const resource = req.params.resource.substring(1);
    const query = req.query;
    const body = req.body;

    const id = req.query.id;
    if (id == null) {
        return res.json({
            "statusCode": "failed",
            "message" : "Error: no ID provided for resource: " + resource + 'id: ', id,
            "data": null,
            "error": null
        });
    };

    // debugDev('Router: PUT for resource:', resource, 'query:', query, 'body:', body);
    // debugDev('');

    // Try, in case model file does not exist
    try {
        // Get the model dynamically (take note of file spelling = resource)
        const canvasSchema = '../model/' + resource;
        const canvasModel = require(canvasSchema);

        // Find and Update DB
        canvasModel.findOneAndUpdate(
            {id: id},
            body,
            {
              new: true,                       // return updated doc
              runValidators: true              // validate before update
            })
            .then(doc => {
                debugDev('updated', doc)
                return res.json({
                    "statusCode": "success",
                    "message" : "Updated record for resource: " + resource + 'id: ', id,
                    "data": doc,
                    "error": null
                });
            })
            .catch(err => {
                console.error(err)
                return res.json({
                    "statusCode": "error",
                    "message" : "Error: Could not update record for resource: " + resource + 'id: ', id,
                    "data": null,
                    "error":
                        {
                            "errorObject": err
                        }
                });
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