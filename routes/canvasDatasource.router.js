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
var constants = require('../utils/constants');
var dataCachingTableArray = null;   // Local copy of dataCachingTable - STRUCTURE
const dataCachingTableVariable = require('../utils/dataCachingTableMemory.util');  // Var loaded at startup

// GET route
router.get('/', (req, res, next) => {

    debugDev('## --------------------------', constants.SERVER_MICROSOFT_SQL);
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





// PUT route
router.put('/', (req, res, next) => {

    debugDev('## --------------------------');
    debugDev('## PUT Starting with canvasDatasources with query:', req.query);

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

        // Create object and save to DB

        // Add Datasource
        // let datasourceAdd = new datasourceModel(datasourceInput);
        // datasourceAdd.save()
        //     .then(datasourceAdded => {

            // ,
            // {
            //     upsert:true,
            //     new: true
            // }

        datasourceModel.findOneAndUpdate(
            { id: datasourceInput.id },
            datasourceInput).then(datasourceAdded => {

                debugDev('Initialise dataCachingTableArray ...')
                dataCachingTableArray = dataCachingTableVariable.get();

                // Safeguard
                if (dataCachingTableArray == null) {
                    dataCachingTableArray = [];
                };

                // Reset the expiryDateTime, so that the next read is from the DB (and not cache)
                let dataCachingTableIndex = dataCachingTableArray.findIndex(dc => dc.key == 'datasources')
                if (dataCachingTableIndex >= 0) {
                    dataCachingTableArray[dataCachingTableIndex].serverExpiryDateTime = new Date();
                };

                debugDev('New Datasource record added in canvasDatasourceRouter for ID: ' + datasourceAdded.id);
 
                // Add Dataset - for now we use the same id: DS - dSet - Data
                datasetInput.id = datasourceAdded.id;
                datasetInput.datasourceID = datasourceAdded.id;
                // let datasetAdd = new datasetModel(datasetInput);
                // datasetAdd.save()
                //     .then(datasetAdded => {

                datasetModel.findOneAndUpdate(
                    { id: datasetInput.id },
                    datasetInput).then(datasetAdded => {
                

                        debugDev('New Dataset record added in canvasDatasourceRouter');

                        // Add Data - for now we use the same id: DS - dSet - Data
                        clientDataInput.id = datasourceAdded.id;

                        if (datasourceAdded.createMethod == 'directFileCSV'){
                            debugDev('Start createMethod directFileCSV');
                            
                            // let dataAdd = new clientDataModel(clientDataInput);
                            // dataAdd.save()
                            //     .then(clientDataAdded => {

                            clientDataModel.findOneAndUpdate(
                                { id: clientDataInput.id },
                                clientDataInput).then(clientDataAdded => {
                    


                                    debugDev('New ClientDataset record added in canvasDatasourceRouter');

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

                                    debugDev('Error Adding new ClientData', err)
                                    return res.json(
                                        createErrorObject(
                                            "error",
                                            "Error: Could not add record for datasource: " + datasourceInput.id,
                                            err
                                        )
                                    );
                                });
            
                        };



                        if (datasourceAdded.createMethod == 'directSQLEditor') {
                            debugDev('Start createMethod directSQLEditor');

                            if (serverType == constants.SERVER_MYSQL) {
                                debugData('MysQL connector not Activated');
                                return res.json(
                                    createErrorObject(
                                        "error",
                                        "MysQL connector not Activated",
                                        null
                                    )
                                );
                            };
                            if (serverType == constants.SERVER_MICROSOFT_SASS) {
                                debugData('Microsoft SSAS connector not Activated');
                                return res.json(
                                    createErrorObject(
                                        "error",
                                        "MicrosoftSSAS connector not Activated",
                                        null
                                    )
                                );
                            };
                            if (serverType == constants.SERVER_POSTGRESS) {
                                debugData('Error PostgresSQL connector not Activated');
                                return res.json(
                                    createErrorObject(
                                        "error",
                                        "PostgresSQL connector not Activated",
                                        null
                                    )
                                );
                            };
                            if (serverType == constants.SERVER_SQLITE) {
                                debugData('Error SQLite connector not Activated')
                                return res.json(
                                    createErrorObject(
                                        "error",
                                        "SQLite connector not Activated",
                                        null
                                    )
                                );
                            };
                            if (serverType == constants.SERVER_ORACLE) {
                                debugData('Error Oracle connector not Activated')
                                return res.json(
                                    createErrorObject(
                                        "error",
                                        "Oracle connector not Activated",
                                        null
                                    )
                                );
                            };
                            if (serverType == constants.SERVER_MONGO) {
                                debugData('Mongo connector not Activated')
                                return res.json(
                                    createErrorObject(
                                        "error",
                                        "Mongo connector not Activated",
                                        null
                                    )
                                );
                            };
                            if (serverType == constants.SERVER_MICROSOFT_SQL) {

                                // Add ClientData
                                debugDev('Start Microsoft SQL connector');
                                execQueryMicrosoftSQL({
                                    serverType: datasourceInput.serverType,
                                    serverName: datasourceInput.serverName,
                                    databaseName: datasourceInput.databaseName,
                                    sqlStatement: datasourceInput.dataSQLStatement,
                                    port: datasourceInput.port,
                                    username: datasourceInput.username,
                                    password: datasourceInput.password,
                                    nrRowsToReturn: 1,
                                    datasourceID: datasourceAdded.id
                                }).then(clientDataAdded => {

                                    debugDev('New ClientDataset record added via Microsoft SQL in canvasDatasourceRouter');

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

                                    debugDev('Error Adding new ClientData', err)
                                    return res.json(
                                        createErrorObject(
                                            "error",
                                            "Error: Could not add record for datasource: " + datasourceInput.id,
                                            err
                                        )
                                    );
                                });
                            };
                        };
                    })
                    .catch(err => {
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







// POST route
router.post('/', (req, res, next) => {

    debugDev('## --------------------------');
    debugDev('## POST Starting with canvasDatasources with query:', req.query);

    // Try, in case model file does not exist
    try {
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

        // Create object and save to DB

        // Add Datasource
        let datasourceAdd = new datasourceModel(datasourceInput);
        datasourceAdd.save()
            .then(datasourceAdded => {

                debugDev('Initialise dataCachingTableArray ...')
                dataCachingTableArray = dataCachingTableVariable.get();

                // Safeguard
                if (dataCachingTableArray == null) {
                    dataCachingTableArray = [];
                };

                // Reset the expiryDateTime, so that the next read is from the DB (and not cache)
                let dataCachingTableIndex = dataCachingTableArray.findIndex(dc => dc.key == 'datasources')
                if (dataCachingTableIndex >= 0) {
                    dataCachingTableArray[dataCachingTableIndex].serverExpiryDateTime = new Date();
                };

                debugDev('New Datasource record added in canvasDatasourceRouter for ID: ' + datasourceAdded.id);
 
                // Add Dataset - for now we use the same id: DS - dSet - Data
                datasetInput.id = datasourceAdded.id;
                datasetInput.datasourceID = datasourceAdded.id;
                let datasetAdd = new datasetModel(datasetInput);
                datasetAdd.save()
                    .then(datasetAdded => {

                        debugDev('New Dataset record added in canvasDatasourceRouter');

                        // Add Data - for now we use the same id: DS - dSet - Data
                        clientDataInput.id = datasourceAdded.id;

                        if (datasourceAdded.createMethod == 'directFileCSV'){
                            debugDev('Start createMethod directFileCSV');
                            
                            let dataAdd = new clientDataModel(clientDataInput);
                            dataAdd.save()
                                .then(clientDataAdded => {

                                    debugDev('New ClientDataset record added in canvasDatasourceRouter');

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

                                    debugDev('Error Adding new ClientData', err)
                                    return res.json(
                                        createErrorObject(
                                            "error",
                                            "Error: Could not add record for datasource: " + datasourceInput.id,
                                            err
                                        )
                                    );
                                });
            
                        };



                        if (datasourceAdded.createMethod == 'directSQLEditor') {
                            debugDev('Start createMethod directSQLEditor');

                            if (serverType == constants.SERVER_MYSQL) {
                                debugData('MysQL connector not Activated');
                                return res.json(
                                    createErrorObject(
                                        "error",
                                        "MysQL connector not Activated",
                                        null
                                    )
                                );
                            };
                            if (serverType == constants.SERVER_MICROSOFT_SASS) {
                                debugData('Microsoft SSAS connector not Activated');
                                return res.json(
                                    createErrorObject(
                                        "error",
                                        "MicrosoftSSAS connector not Activated",
                                        null
                                    )
                                );
                            };
                            if (serverType == constants.SERVER_POSTGRESS) {
                                debugData('Error PostgresSQL connector not Activated');
                                return res.json(
                                    createErrorObject(
                                        "error",
                                        "PostgresSQL connector not Activated",
                                        null
                                    )
                                );
                            };
                            if (serverType == constants.SERVER_SQLITE) {
                                debugData('Error SQLite connector not Activated')
                                return res.json(
                                    createErrorObject(
                                        "error",
                                        "SQLite connector not Activated",
                                        null
                                    )
                                );
                            };
                            if (serverType == constants.SERVER_ORACLE) {
                                debugData('Error Oracle connector not Activated')
                                return res.json(
                                    createErrorObject(
                                        "error",
                                        "Oracle connector not Activated",
                                        null
                                    )
                                );
                            };
                            if (serverType == constants.SERVER_MONGO) {
                                debugData('Mongo connector not Activated')
                                return res.json(
                                    createErrorObject(
                                        "error",
                                        "Mongo connector not Activated",
                                        null
                                    )
                                );
                            };
                            if (serverType == constants.SERVER_MICROSOFT_SQL) {

                                // Add ClientData
                                debugDev('Start Microsoft SQL connector');
                                execQueryMicrosoftSQL({
                                    serverType: datasourceInput.serverType,
                                    serverName: datasourceInput.serverName,
                                    databaseName: datasourceInput.databaseName,
                                    sqlStatement: datasourceInput.dataSQLStatement,
                                    port: datasourceInput.port,
                                    username: datasourceInput.username,
                                    password: datasourceInput.password,
                                    nrRowsToReturn: 1,
                                    datasourceID: datasourceAdded.id
                                }).then(clientDataAdded => {

                                    debugDev('New ClientDataset record added via Microsoft SQL in canvasDatasourceRouter');

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

                                    debugDev('Error Adding new ClientData', err)
                                    return res.json(
                                        createErrorObject(
                                            "error",
                                            "Error: Could not add record for datasource: " + datasourceInput.id,
                                            err
                                        )
                                    );
                                });
                            };
                        };
                    })
                    .catch(err => {
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
                debugDev('Error Adding new Datasource', err)
                return res.json(
                    createErrorObject(
                        "error",
                        "Error: Could not add record for datasource: " + datasourceInput.id,
                        err
                    )
                );
            });
    } catch (error) {
        debugDev('canvasDatasource.POST Error: ', error)
        return res.json(
            createErrorObject(
                "error",
                "Error: Could not add record for datasource: " + datasourceInput.id,
                error
            )
        );
    };
})

// Export
module.exports = router;