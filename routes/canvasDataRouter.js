// Router for All Canvas (application-specific) data routes

// Imports
const express = require('express');
const passport = require('passport');
const router = express.Router();
const config = require('config');
const debugDev = require('debug')('app:dev');





// CACHING BITS HERE
// Variables
let dashboards = []; // [ {id:1, name: "name1"}, {id:2, name: "name2"}, ]






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
    
    // Validate
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







    // CACHING BITS HERE

    // Load global variable for cachingTable into an Array
    const dataCachingTableVariable = require('../utils/dataCachingTableMemory');
    const dataCachingTableArray = dataCachingTableVariable.get();

    // Assume worse case
    let isFresh = false;

    // TODO - should be easier with TS
    // Single instance (row) in cachingTable for current resource
    let serverDataCachingTable = null;
    inCachingTable = false;
    // debugDev('The localDataCachingTable.length: ', localDataCachingTableArray.length, req.params);

    // TODO - use findIndex in TS
    // Loop on cachingTableArray
    for (var i = 0; i < dataCachingTableArray.length; i++) {

        // Find the single instance (row) for current resource: it uses caching
        if (dataCachingTableArray[i].key == resource) {

            // Extract info into variables
            serverDataCachingTable = dataCachingTableArray[i];
            let serverCacheableMemory = serverDataCachingTable.serverCacheableMemory;
            let serverVariableName = serverDataCachingTable.serverVariableName;
            
            inCachingTable = true;
            if (dashboards.length > 0) {
                console.log('D from last time:', dashboards, serverCacheableMemory, serverVariableName)
            };
            if (dashboards.length == 0) {
                dashboards = [ {id:1, name: "name1"}, {id:2, name: "name2"}, ]
                console.log('D initialize:', dashboards, serverCacheableMemory, serverVariableName)
            };

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
                console.log('xx freshness', isFresh)


                // Use server cache variable or table if fresh
                if (!isFresh) {
                    if ( (serverVariableName != null)
                            &&
                            (serverVariableName.length != 0)
                        ) {
                        console.warn('xx return from VAR ****************');
// var type = 'article';
// this[type+'_count'] = 1000;  // in a function we use "this";
// alert(this.article_count);
                        console.warn('xx VAR dashboards', dashboards, eval(serverVariableName) )

                        return res.json({
                            "statusCode": "success",
                            "message" : "Retrieved data for resource: " + resource,
                            "data": eval(serverVariableName),
                            // "metaData": {
                            //     "table": {
                            //         "tableName": "", //oneDoc.mongooseCollection.collectionName,
                            //         "nrRecordsReturned":docs.length
                            //     },
                            //     "fields": fields
                            // },
                            "error": null
                        });
                        // return;
                    };
                };


            }



        };
    };

    // let cachingIndex = dataCachingTable.findIndex(dc => dc.key == 'dashboards')
    // console.log('xx index', cachingIndex)
    if (inCachingTable) {
        debugDev('This resource uses caching');
    } else {
        debugDev('This resource does NOT use caching');
    };
    // console.log('xx RESULT', localDataCachingTable)




    // Try, in case model file does not exist
    try {
        // Get the model dynamically (take note of file spelling = resource)
        const canvasSchema = '../model/' + resource;
        debugDev('Using Model ', canvasSchema)
        const canvasModel = require(canvasSchema);


        // Find the data (using the standard query JSON object)
        canvasModel.find( query, (err, docs) => {

            // Extract metodata from the Schema, using one document
            // const oneDoc = canvasModel.findOne();

            // Empty Array of fields
            var fields = [];

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