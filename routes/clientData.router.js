// Router for All Client data, ie XIS Trades, Sales History, etc

// Imports
const express = require('express');
const router = express.Router();
const debugData = require('debug')('app:data');
const debugDev = require('debug')('app:dev');
const datalayer = require('../databaseConnectors/mysql.datalayer');
const isDateInFuture = require('../utils/dateFunctions');
const metaDataFromDatasource = require('../utils/metaDataFromDatasource.util');
const sortFilterFieldsAggregate = require('../utils/sortFilterFieldsAggregate.util');

// Runs for ALL requests
router.use('/', (req, res, next) => {

    // Validate id of clientData provided
    const id = req.query.id;
    debugData('query is ', id);

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
        let isFresh = !isDateInFuture(datasource.serverExpiryDateTime);

        // If cached and isFresh, result = cache
        if (datasource.cacheResultsOnServer  &&  isFresh) {
            debugDev(' <- Getting data from Server Cache on Disc')

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
console.log('results', results, afterSort)
                var fields = [];

                fields = metaDataFromDatasource(datasource);

                // // 9. Add metadata, hopefully obtained directly from the source DB, or from the DS (if pre-stored),
                // //    with prudent defaults where unknown.
                // if (datasource.dataFields != null) {
                //     if (datasource.dataFieldTypes == null) {
                //         datasource.dataFieldTypes = [];
                //     };
                //     if (datasource.dataFieldLengths == null) {
                //         datasource.dataFieldLengths = [];
                //     };

                //     var fields = [];

                //     // Loop on metatdata
                //     for (var i = 0; i < datasource.dataFields.length; i++) {
                //         const fieldName = datasource.dataFields[i];

                //         let fieldType = '';
                //         if (i < datasource.dataFieldTypes.length) {
                //             fieldType = datasource.dataFieldTypes[i];
                //         };

                //         let fieldLength = '';
                //         if (i < datasource.dataFieldLengths.length) {
                //             fieldLength = datasource.dataFieldLengths[i];
                //         };

                //         fields.push(
                //             {
                //                 "fieldName": fieldName,
                //                 "fieldType": fieldType,
                //                 "length": fieldLength,
                //                 "average": null,
                //                 "max": null,
                //                 "median": null,
                //                 "min": null,
                //                 "sum": null
                //             }
                //         );
                //     };
                // };

                // 10. Calc how many records are returned
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
            debugDev(' <- Getting data from Source')

            // Get the data from Source, depending on the serverType
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
                datalayer.getData(datasource, req.query)
                    .then(resResultsObject => {
                        console.log('resResultsObject', resResultsObject)
                        return res.json(resResultsObject)
                     } )
                    .catch(resErrorObject  => {
                        console.log('resErrorObject', resErrorObject)
                        return res.json(resErrorObject) 
                    });
            };

        };
    });


    // KEEP !!!
    // This is the code to get /data?id=x from the Mongo data  ~  Disc Caching.
    // It works !!!
    //
    // Try, in case model file does not exist
    // try {
    //     // Get the model
    //     const clientSchema = '../model.model/clientData.model';
    //     const clientModel = require(clientSchema);
    //     debugData('Using Schema clientData');

    //     // Find the data (using the standard query JSON object)
    //     clientModel.find( reqQuery, (err, docs) => {

    //         // Extract metodata from the Schema, using one document
    //         // const oneDoc = clientModel.findOne();

    //         // Empty Array of fields
    //         var fields = [];

    //         // Loop on metatdata
    //         // for (var key in oneDoc.schema.obj) {
    //         //     var value = oneDoc.schema.obj[key];

    //         //     fields.push(
    //         //         {
    //         //             "fieldName": key,
    //         //             "fieldType": value.name,
    //         //             "average": null,
    //         //             "max": null,
    //         //             "median": null,
    //         //             "min": null,
    //         //             "sum": null
    //         //         }
    //         //     );
    //         // };

    //         // console.log('xx COUNT', fields, oneDoc.mongooseCollection.collectionName, docs.length)
    //         // Return the data with metadata
    //         return res.json({
    //             "statusCode": "success",
    //             "message" : "Retrieved data for id:" + id,
    //             "data": docs[0].data,
    //             "metaData": {
    //                 "table": {
    //                     "tableName": "", //oneDoc.mongooseCollection.collectionName,
    //                     "nrRecordsReturned":docs.length
    //                 },
    //                 "fields": fields
    //             },
    //             "error": null
    //         });
    //     });
    // }
    // catch (error) {
    //     return res.status(400).json({
    //         "statusCode": "error",
    //         "message" : "Model clientData does not exist, or contains errors",
    //         "data": null,
    //         "error": error
    //     });
    // };

})

// POST route
router.post('/', (req, res, next) => {

    // Extract: body, route (params without :)
    const body = req.body;
    const query = req.query;
    const id = req.query.id;
    debugData('clientDataRouter: POST for id:', id, 'body:', body)
    debugData('');

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

    debugData('clientDataRouter: DELETE for id:', id, 'body:', body, 'query:', query)
    debugData('');

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

    debugData('clientDataRouter: PUT for id:', id, 'body:', body, 'query:', query)
    debugData('');

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