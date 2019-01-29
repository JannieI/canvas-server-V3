// Router for Canvas Datasource
// Treats the Datasource - Dataset - Data objects in one go to keep i sync, and with same IDs

// Imports
const express = require('express');
const router = express.Router();
const debugDev = require('debug')('app:dev');
const createErrorObject = require('../utils/createErrorObject.util');
const createReturnObject = require('../utils/createReturnObject.util');
const datasourceSchema = '../models/datasources.model';
const datasetSchema = '../models/datasets.model';
const clientDataSchema = '../models/clientData.model';
const execQueryMicrosoftSQL = require('../datalayer/microsoftSQL.execQuery.datalayer');

// GET route
router.get('/', (req, res, next) => {

    debugDev('## --------------------------');
    debugDev('## GET Starting with CurrentDashboard with query:', req.query);

    // Try, in case model file does not exist
    try {
        // Get the model dynamically
        const datasourceModel = require(datasourceSchema);
        const datasetModel = require(datasetSchema);
        const clientDataModel = require(clientDataSchema);

        const datasourceID = req.query.id;

        // Find Datasource
        const datasourceQuery = { id: datasourceID };

        datasourceModel.find( datasourceQuery, (err, datasources) => {

            if (err) {
                return res.json(createErrorObject(
                    "error",
                    "Error retrieving Datasource for ID: " + req.query.id,
                    err
                ));
            };
            if (datasources == null) {
                datasources = [];
            };

            // Find Datasets
            const datasetQuery = { datasourceID: datasourceID }
            datasetModel.find( datasetQuery, (err, datasets) => {

                if (err) {
                    return res.json(createErrorObject(
                        "error",
                        "Error retrieving Datasets for ID: " + datasourceID,
                        err
                    ));
                };

                // Find Data
                const dataQuery = { id: datasourceID }
                clientDataModel.find( dataQuery, (err, clientData) => {

                    if (err) {
                        return res.json(createErrorObject(
                            "error",
                            "Error retrieving Data for ID: " + req.query.id,
                            err
                        ));
                    };
                    if (clientData == null) {
                        clientData = [];
                    };

                    // Return the data with metadata
                    return res.json(
                        createReturnObject(
                            "success",
                            "Retrieved data for Current Dashboard ID: " + req.query.id,
                            {
                                datasources: datasources,
                                datasets: datasets,
                                clientData: clientData
                            },
                            null,
                            null,
                            null,
                            null,
                            null,
                            datasources.length,
                            null,
                            null
                            )
                    );
                });
            });
        });
    }
    catch (error) {
        debugDev('Error in canvasCurrentDashboard.router', error.message)
        return res.status(400).json({
            "statusCode": "error",
            "message" : "Error retrieving Current Dashboard ID: " + req.query.id,
            "data": null,
            "error": error
        });
    };

})


// POST route
router.post('/', (req, res, next) => {

    debugDev('## --------------------------');
    debugDev('## POST Starting with canvasDatasources with query:', req.query);

    // Try, in case model file does not exist
    // try {
        // Get the model dynamically
        const datasourceModel = require(datasourceSchema);
        const datasetModel = require(datasetSchema);
        const clientDataModel = require(clientDataSchema);

        const bodyInput = JSON.parse(JSON.stringify(req.body))
        const datasourceInput = bodyInput.datasourceInput;
        const datasetInput = bodyInput.datasetInput;
        const clientDataInput = bodyInput.clientDataInput;
        console.log('input', datasourceInput, datasetInput, clientDataInput)

        // Validation
        if (datasourceInput == null  ||  datasourceInput == undefined) {
            debugDev('Error: input datasourceInput variable is empty');
            return res.json(
                createErrorObject(
                    "error",
                    "Error: input datasourceInput variable is empty",
                    null
                )
            );
        };
        if (datasetInput == null) {
            debugDev('Error: input datasetInput variable is empty')
            return res.json(
                createErrorObject(
                    "error",
                    "Error: input datasetInput variable is empty",
                    null
                )
            );
        };
        if (clientDataInput == null) {
            debugDev('Error: input clientDataInput variable is empty')
            return res.json(
                createErrorObject(
                    "error",
                    "Error: input clientDataInput variable is empty",
                    null
                )
            );
        };
        console.log('wtf 0')
        // Create object and save to DB

        // Add Datasource
        let datasourceAdd = new datasourceModel(datasourceInput);
        datasourceAdd.save()
            .then(datasourceAdded => {
                console.log('wtf 1')
                debugDev('New Datasource record added in canvasDatasourceRouter', datasourceAdded);
 
                // Add Dataset - for now we use the same id: DS - dSet - Data
                datasetInput.id = datasourceAdded.id;
                datasetInput.datasourceID = datasourceAdded.id;
                let datasetAdd = new datasetModel(datasetInput);
                datasetAdd.save()
                    .then(datasetAdded => {
                        console.log('wtf 1')
                        debugDev('New Dataset record added in canvasDatasourceRouter', datasetAdded);

                        // Add ClientData
                        debugDev('Start Microsoft SQL connector');
                        execQueryMicrosoftSQL({
                            serverType: datasourceInput.serverType,
                            serverName: datasourceInput.serverName,
                            databaseName: datasourceInput.databaseName,
                            sqlStatement: datasourceInput.sqlStatement,
                            port: datasourceInput.port,
                            username: datasourceInput.username,
                            password: datasourceInput.password,
                            nrRowsToReturn: 1,
                            datasourceID: datasourceAdded.id
                        }                        )
                        // { serverType: 'MicrosoftSQL',
                        // serverName: 'localhost',
                        // databaseName: 'VCIB_DemoData',
                        // sqlStatement: 'SELECT TOP 11 CAST( DATEPART( year,EffectiveDate ) AS VARCHAR( 4 ) ) As Year, DATEPART( month,EffectiveDate ) Month, 1 AS Number FROM VCIB_RaisedPremiums',
                        // port: '1433',
                        // username: 'sa',
                        // password: 'Qwerty,123',
                        // nrRowsToReturn: '1' })

                        //     .then(resultsObject => {
                        //         debugData('Returned results of SQL Statement from Microsoft SQL');  
                        //         return res.json(resultsObject);
                        //      } )
                        //     .catch(errorObject  => {
                        //         debugDev("Error in clientData.router.execQuery", errorObject);
                        //         return res.json(errorObject);
                        //     });

                        // clientDataInput.id = datasourceAdded.id;
                        // let datasetAdd = new clientDataModel(clientDataInput);
                        // datasetAdd.save()
                            .then(clientDataAdded => {
                                console.log('wtf 1')
                                debugDev('New ClientDataset record added in canvasDatasourceRouter', datasetAdded);

                                // Return
                                return res.json(
                                    createReturnObject(
                                        "success",
                                        "Added ALL records for datasource, ID: " + datasourceAdded.id,
                                        {
                                                datasource: datasourceAdded,
                                                datasets: datasetAdded,
                                                clientData: clientDataAdded
                                        },
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
                                console.log('wtf 44')
                                debugDev('Error Adding new ClientData', err)
                                return res.json(
                                    createErrorObject(
                                        "error",
                                        "Error: Could not add record for datasource: " + datasourceInput.id,
                                        err
                                    )
                                );
                            });

                    })
                    .catch(err => {
                        console.log('wtf 2')
                        debugDev('Error Adding new Datasource', err)
                        return res.json(
                            createErrorObject(
                                "error",
                                "Error: Could not add record for datasource: " + datasourceInput.id,
                                err
                            )
                        );
                    });
                


            })
            .catch(err => {
                console.log('wtf 2')
                debugDev('Error Adding new Datasource', err)
                return res.json(
                    createErrorObject(
                        "error",
                        "Error: Could not add record for datasource: " + datasourceInput.id,
                        err
                    )
                );
            });




    // }
    // catch (error) {
    //     debugDev('Error in canvasCurrentDashboard.router', error.message)
    //     return res.status(400).json({
    //         "statusCode": "error",
    //         "message" : "Error retrieving Current Dashboard ID: " + req.query.id,
    //         "data": null,
    //         "error": error
    //     });
    // };

})

// Export
module.exports = router;