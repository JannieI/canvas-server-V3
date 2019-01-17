// Router for All Client data, ie XIS Trades, Sales History, etc

// Imports
const express = require('express');
const router = express.Router();
const debugData = require('debug')('app:data');
const debugDev = require('debug')('app:dev');
const getClientData = require('../datalayer/mysql.getClientData.datalayer');
const isDateInFuture = require('../utils/dateFunctions.util');
const metaDataFromDatasource = require('../utils/metaDataFromDatasource.util');
const sortFilterFieldsAggregate = require('../utils/sortFilterFieldsAggregate.util');

// GET route
router.get('/', (req, res, next) => {

    // 1. Get the datasourceID from req.query
    const datasourceID = req.query.datasourceID;

    // Validate id of clientData provided
    debugDev('Start clientData.router for datasourceID:', datasourceID);

	if (datasourceID == null) {
        return res.status(400).json({
            "statusCode": "error",
            "message" : "No datasourceID provided in query string",
            "data": null,
            "error": "No datasourceID provided in query string"
        });
    };

	if (isNaN(datasourceID)) {
        return res.status(400).json({
            "statusCode": "error",
            "message" : "datasourceID parameter must be a number.  Provided:", datasourceID,
            "data": null,
            "error": "datasourceID parameter must be a number.  Provided:", datasourceID
        });
    };


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
        if (datasourceArray.length > 1) {
            debugData("Error: Duplicate Datasource in Mongo DB for the datasourceID provided: "
                + datasourceID)
            return res.json({
                "statusCode": "error",
                "message" : "Duplicate Datasource in Mongo DB for the datasourceID provided:"
                     + datasourceID,
                "data": null,
                "error":
                    {
                        message: "Duplicate Datasource in Mongo DB for the datasourceID provided: " + datasourceID
                    }
            });
        };
        if (datasourceArray.length == 0) {
            debugData('Error:', "No Datasource exists for the datasourceID provided:" + datasourceID)
            return res.json({
                "statusCode": "success",
                "message" : "No Datasource exists for the datasourceID provided:" + datasourceID,
                "data": [],
                "error": null
            });
        };

        // Set the DS var
        const datasource = datasourceArray[0];


        //  3. Get the data from the correct location: Canvas Cache, or Source (one of many
        //     types) from the Canvas DB

        // Each record in cache is time-stamped with serverExpiryDateTime at the time it is saved.
        // When reading a record: if serverExpiryDateTime is in the future, the data in the cache
        // is still fresh.
        let isFresh = isDateInFuture(datasource.serverExpiryDateTime);

        // If cached and isFresh, result = cache
        if (datasource.cacheResultsOnServer  &&  isFresh) {
            debugData(' <- Getting data from Server Cache on Disc')

            // Get the model
            const clientSchema = '../models/clientData.model';
            const clientModel = require(clientSchema);
            debugData('Using Schema clientData');

            // Find the data
            clientModel.find( { id: datasourceID } , (err, docs) => {

                // results = Array, catering for no data returned
                // Note that the clientData cache had this structure {id, data}.  The data object
                // contains all the records.
                let results = [];
                if (docs != null  &&  docs.length != 0) {
                    results = docs[0].data;

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
                };

                // Collect MetaData
                var metaDataFields = [];
                metaDataFields = metaDataFromDatasource(datasource, req.query);
                let tableName = datasource.dataTableName;
                if (datasource.dataSQLStatement != "") {
                    tableName = 'SQL Statement';
                };

                // Calc how many records are returned
                let nrRecordsReturned = 0;
                if (results != null) {
                    nrRecordsReturned = results.length;
                };

                // Return the data with metadata
                return res.json({
                    "statusCode": "success",
                    "message" : "Retrieved data for id: " + datasourceID,
                    "data": results,
                    "metaData": {
                        "table": {
                            "tableName": tableName,
                            "nrRecordsReturned": nrRecordsReturned
                        },
                        "fields": metaDataFields
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
            // Note on error-bubbling:
            // clientDataRoutine (this routine): res.json(error-object)
            //   --calls-->  mysql.getData.datalayer: returns error-object
            //         --calls-->  sortFilterFieldts: returns error-object

            if (datasource.serverType == 'MySQL') {
                getClientData(datasource, req.query)
                    .then(resultsObject => {
                        debugData('Records returned from MySQL: ', resultsObject.metaData.table.nrRecordsReturned);
                        return res.json(resultsObject);
                     } )
                    .catch(errorObject  => {
                        debugDev("Error in clientData.router");
                        return res.json(errorObject);
                    });
            };

        };
    });

})

// DELETE once for sure
// These are not needed as we dont change clientData
// // POST route
// router.post('/', (req, res, next) => {

//     // Extract: body, route (params without :)
//     const body = req.body;
//     const query = req.query;
//     const id = req.query.id;
//     debugDev('clientDataRouter: POST for id:', id, 'body:', body)

//     // Try, in case model file does not exist
//     try {
//         // Get the model
//         const clientSchema = '../models/clientData.model';
//         const clientModel = require(clientSchema);
//         debugData('Using Schema clientData');

//         // Create object and save to DB
//         let canvasAdd = new clientModel(body);
//         canvasAdd.save()
//             .then(doc => {
//                 debugData('saved', doc)
//                 return res.json({
//                     "statusCode": "success",
//                     "message" : "Added record for resource: " + resource,
//                     "data": doc,
//                     "error": null
//                 });
//             })
//             .catch(err => {
//                 console.error(err)
//                 return res.json({
//                     "statusCode": "error",
//                     "message" : "Error: Could not add record for id:", id,
//                     "data": null,
//                     "error":
//                         {
//                             "errorObject": err
//                         }
//                 });
//         });
//     }
//     catch (error) {
//         return res.status(400).json({
//             "statusCode": "error",
//             "message" : "No model file for id:", id,
//             "data": null,
//             "error": error
//         });
//     };

// });

// // DELETE route
// router.delete('/', (req, res, next) => {

//     // Extract: body, route (params without :)
//     const query = req.query;
//     const id = req.query.id;

//     debugDev('clientDataRouter: DELETE for id:', id, 'body:', body, 'query:', query)

//     if (id == null) {
//         return res.json({
//             "statusCode": "failed",
//             "message" : "Error: no id provided:" + id,
//             "data": null,
//             "error": null
//         });
//     };

//     // Try, in case model file does not exist
//     try {
//         // Get the model
//         const clientSchema = '../models/clientData.model';
//         const clientModel = require(clientSchema);
//         debugData('Using Schema clientData');

//         // Find and Delete from DB
//         clientModel.findOneAndRemove({id: id})
//             .then(doc => {
//                 debugData('deleted', doc)

//                 if (doc == null) {
//                     return res.json({
//                         "statusCode": "error",
//                         "message" : "Deletion of data failed: could not find id = " + id,
//                         "data": doc,
//                         "error": null
//                     });
//                 } else {
//                     return res.json({
//                         "statusCode": "success",
//                         "message" : "Deleted record for id:" + id,
//                         "data": doc,
//                         "error": null
//                     });
//                 };
//             })
//             .catch(err => {
//                 console.error(err)
//                 return res.json({
//                     "statusCode": "error",
//                     "message" : "Error: Could not delete record for id:" + id ,
//                     "data": null,
//                     "error":
//                         {
//                             "errorObject": err
//                         }
//                 });
//         });
//     }
//     catch (error) {
//         return res.status(400).json({
//             "statusCode": "error",
//             "message" : "No model file for id:", id,
//             "data": null,
//             "error": error
//         });
//     };

// });

// // PUT route
// router.put('/', (req, res, next) => {

//     // Extract: body, route (params without :)
//     const resource = req.params.resource.substring(1);
//     const body = req.body;
//     const query = req.query;
//     const id = req.query.id;

//     debugDev('clientDataRouter: PUT for id:', id, 'body:', body, 'query:', query)

//     // Try, in case model file does not exist
//     try {
//         // Get the model
//         const clientSchema = '../models/clientData.model';
//         const clientModel = require(clientSchema);
//         debugData('Using Schema clientData');

//         // Find and Update DB
//         clientModel.findOneAndUpdate(
//             {id: id},
//             body,
//             {
//               new: true,                       // return updated doc
//               runValidators: true              // validate before update
//             })
//             .then(doc => {
//                 debugData('updated', doc)
//                 return res.json({
//                     "statusCode": "success",
//                     "message" : "Updated record for id:", id,
//                     "data": doc,
//                     "error": null
//                 });
//             })
//             .catch(err => {
//                 console.error(err)
//                 return res.json({
//                     "statusCode": "error",
//                     "message" : "Error: Could not update record for id:", id,
//                     "data": null,
//                     "error":
//                         {
//                             "errorObject": err
//                         }
//                 });
//         });
//     }
//     catch (error) {
//         return res.status(400).json({
//             "statusCode": "error",
//             "message" : "No model file for id:", id,
//             "data": null,
//             "error": error
//         });
//     };

// });

// Export
module.exports = router;