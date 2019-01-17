// Router for All Client data, ie XIS Trades, Sales History, etc

// Imports
const express = require('express');
const router = express.Router();
const debugData = require('debug')('app:data');
const debugDev = require('debug')('app:dev');
const getClientData = require('../datalayer/mysql.getClientData.datalayer');
const isDateInFuture = require('../utils/dateFunctions');
const metaDataFromDatasource = require('../utils/metaDataFromDatasource.util');
const sortFilterFieldsAggregate = require('../utils/sortFilterFieldsAggregate.util');

// Runs for ALL requests
router.use('/', (req, res, next) => {

    // Validate id of clientData provided
    const id = req.query.id;
    debugDev('query is ', id);

	if (id == null) {
        return res.status(400).json({
            "statusCode": "error",
            "message" : "No id provided in query string",
            "data": null,
            "error": "No id provided in query string"
        });
    };

	if (isNaN(id)) {
        return res.status(400).json({
            "statusCode": "error",
            "message" : "id parameter must be a number",
            "data": null,
            "error": "id parameter must be a number"
        });
    };

    // Continue
    next();
})

// GET route
router.get('/', (req, res, next) => {

    // In short: the structure of this route is as follows:
    //  1. Get the datasourceID from req.query
    //  2. Get the DS (Datasource) record for the given datasourceID in req.query.
    //  3. Get the data from the correct location: Canvas Cache, or Source (one of many types)


    // 1. Get the datasourceID from req.query
    const id = req.query.id;
    const datasourceID = req.query.datasourceID;

    // 2. Get the DS (Datasource) record for the given datasourceID in req.query.
    const datasourceSchema = '../models/datasources.model';
    const datasourceModel = require(datasourceSchema);
    const datasourceIDQuery = { id: datasourceID };

    datasourceModel.find( datasourceIDQuery, (err, datasourceArray) => {
        if (err) {
            console.error('Error:', err)
            res.json({
                "statusCode": "error",
                "message" : "Error finding Datasource in Mongo DB",
                "data": null,
                "error": err
            });
            return;
        };
        if (datasourceArray.length != 1) {
            console.error('Error:', err)
            res.json({
                "statusCode": "error",
                "message" : "Expected EXACTLY one Datasource in Mongo DB, not "
                    + datasourceArray.length + ' for the datasourceID provided:' + datasourceID,
                "data": null,
                "error": err
            });
            return;
        }

        // Set the DS var
        const datasource = datasourceArray[0];

        //  3. Get the data from the correct location: Canvas Cache, or Source (one of many types)
        let isFresh = isDateInFuture(datasource.serverExpiryDateTime);

        // If cached and isFresh, result = cache
        if (datasource.cacheResultsOnServer  &&  isFresh) {
            debugData(' <- Getting data from Server Cache on Disc')

            // Get the model
            const clientSchema = '../models/clientData.model';
            const clientModel = require(clientSchema);
            debugData('Using Schema clientData');

            // Find the data (using the standard query JSON object)
            clientModel.find( { id } , (err, docs) => {

                let results = docs[0].data;

                // Extract the Widget specific data (sort, filter, fields, aggregate)
                let afterSort;
                afterSort =  sortFilterFieldsAggregate(results, req.query);

                // Return if an Error
                if (afterSort.error) {
                    return res.status(400).json({
                        "statusCode": "error",
                        "message" : "Error in the sortFilterFieldsAggregate routine",
                        "data": null,
                        "error": error
                    });
                };

                // Update results with this information
                results = afterSort.results;

                // Collect MetaData
                var fields = [];
                fields = metaDataFromDatasource(datasource, req.query);

                // Calc how many records are returned
                let nrRecordsReturned = 0;
                if (results != null) {
                    nrRecordsReturned = results.length;
                };

                // 11. Return the data with metadata
                return res.json({
                    "statusCode": "success",
                    "message" : "Retrieved data for id:" + id,
                    "data": results,
                    "metaData": {
                        "table": {
                            "tableName": "", //oneDoc.mongooseCollection.collectionName,  TODO
                            "nrRecordsReturned": nrRecordsReturned
                        },
                        "fields": fields
                    },
                    "error": null
                });
            });
        } else {
            // Else, get from Source using the correct data-layer-function depending on the DB type (ie MySQL or Mongo).
            debugData(' <- Getting data from Source')

            // Get the data from Source, depending on the serverType
            if (datasource.serverType == 'Microsoft SSAS') {
                // Do thing here
            };
            if (datasource.serverType == 'PostgresSQL') {
                // Do thing here
            };
            if (datasource.serverType == 'Microsoft SQL') {
                // Do thing here
            };
            if (datasource.serverType == 'SQLite') {
                // Do thing here
            };
            if (datasource.serverType == 'Oracle') {
                // Do thing here
            };
            if (datasource.serverType == 'Mongo') {
                // Do thing here
            };

            // Get the Source Data via the Canvas Data Layer
            if (datasource.serverType == 'MySQL') {
                getClientData(datasource, req.query)
                    .then(resResultsObject => {
                        console.log('Returned from MySQL', resResultsObject.length)
                        return res.json(resResultsObject)
                     } )
                    .catch(resErrorObject  => {
                        return res.json(resErrorObject) 
                    });
            };

        };
    });

})

// POST route
router.post('/', (req, res, next) => {

    // Extract: body, route (params without :)
    const body = req.body;
    const query = req.query;
    const id = req.query.id;
    debugDev('clientDataRouter: POST for id:', id, 'body:', body)

    // Try, in case model file does not exist
    try {
        // Get the model
        const clientSchema = '../models/clientData.model';
        const clientModel = require(clientSchema);
        debugData('Using Schema clientData');

        // Create object and save to DB
        let canvasAdd = new clientModel(body);
        canvasAdd.save()
            .then(doc => {
                debugData('saved', doc)
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
                    "message" : "Error: Could not add record for id:", id,
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
            "message" : "No model file for id:", id,
            "data": null,
            "error": error
        });
    };

});

// DELETE route
router.delete('/', (req, res, next) => {

    // Extract: body, route (params without :)
    const query = req.query;
    const id = req.query.id;

    debugDev('clientDataRouter: DELETE for id:', id, 'body:', body, 'query:', query)

    if (id == null) {
        return res.json({
            "statusCode": "failed",
            "message" : "Error: no id provided:" + id,
            "data": null,
            "error": null
        });
    };

    // Try, in case model file does not exist
    try {
        // Get the model
        const clientSchema = '../models/clientData.model';
        const clientModel = require(clientSchema);
        debugData('Using Schema clientData');

        // Find and Delete from DB
        clientModel.findOneAndRemove({id: id})
            .then(doc => {
                debugData('deleted', doc)

                if (doc == null) {
                    return res.json({
                        "statusCode": "error",
                        "message" : "Deletion of data failed: could not find id = " + id,
                        "data": doc,
                        "error": null
                    });
                } else {
                    return res.json({
                        "statusCode": "success",
                        "message" : "Deleted record for id:" + id,
                        "data": doc,
                        "error": null
                    });
                };
            })
            .catch(err => {
                console.error(err)
                return res.json({
                    "statusCode": "error",
                    "message" : "Error: Could not delete record for id:" + id ,
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
            "message" : "No model file for id:", id,
            "data": null,
            "error": error
        });
    };

});

// PUT route
router.put('/', (req, res, next) => {

    // Extract: body, route (params without :)
    const resource = req.params.resource.substring(1);
    const body = req.body;
    const query = req.query;
    const id = req.query.id;

    debugDev('clientDataRouter: PUT for id:', id, 'body:', body, 'query:', query)

    // Try, in case model file does not exist
    try {
        // Get the model
        const clientSchema = '../models/clientData.model';
        const clientModel = require(clientSchema);
        debugData('Using Schema clientData');

        // Find and Update DB
        clientModel.findOneAndUpdate(
            {id: id},
            body,
            {
              new: true,                       // return updated doc
              runValidators: true              // validate before update
            })
            .then(doc => {
                debugData('updated', doc)
                return res.json({
                    "statusCode": "success",
                    "message" : "Updated record for id:", id,
                    "data": doc,
                    "error": null
                });
            })
            .catch(err => {
                console.error(err)
                return res.json({
                    "statusCode": "error",
                    "message" : "Error: Could not update record for id:", id,
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
            "message" : "No model file for id:", id,
            "data": null,
            "error": error
        });
    };

});

// Export
module.exports = router;