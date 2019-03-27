// Router for Canvas Datasource
// Treats the Datasource - Data objects in one go to keep i sync, and with same IDs

// Imports
const express = require('express');
const router = express.Router();
const debugDev = require('debug')('app:dev');
const createErrorObject = require('../utils/createErrorObject.util');
const createReturnObject = require('../utils/createReturnObject.util');
const datasourceSchema = '../models/datasources.model';
const clientDataSchema = '../models/clientData.model';
const execQueryMicrosoftSQL = require('../datalayer/microsoftSQL.execQuery.datalayer');
var constants = require('../utils/constants');
var dataCachingTableArray = null;   // Local copy of dataCachingTable - STRUCTURE
const dataCachingTableVariable = require('../utils/dataCachingTableMemory.util');  // Var loaded at startup

// GET route
router.get('/', (req, res, next) => {
    const startPos = module.id.lastIndexOf("/");
    if (startPos > 0  &&  startPos < module.id.length) {
        moduleName = module.id.substring(startPos + 1);
    };

    debugDev(moduleName + ": " + '## --------------------------', constants.SERVER_MICROSOFT_SQL);
    debugDev(moduleName + ": " + '## GET Starting with canvasDatasource with query:', req.query);

    // Try
    try {
        // Get the model dynamically
        const datasourceModel = require(datasourceSchema);
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
                        "canvasDatasource",
                        "Retrieved data for Current Dashboard ID: " + req.query.id,
                        {
                            datasources: datasources,
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
    }
    catch (error) {
        debugDev(moduleName + ": " + 'Error in canvasDatasource.router', error.message)
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
    const startPos = module.id.lastIndexOf("/");
    if (startPos > 0  &&  startPos < module.id.length) {
        moduleName = module.id.substring(startPos + 1);
    };

    debugDev(moduleName + ": " + '## --------------------------');
    debugDev(moduleName + ": " + '## PUT Starting with canvasDatasources with query:', req.query);

    // Try
    try {
        // Get the model dynamically
        const datasourceModel = require(datasourceSchema);
        const clientDataModel = require(clientDataSchema);

        const bodyInput = JSON.parse(JSON.stringify(req.body))
        const datasourceInput = bodyInput.datasourceInput;
        const clientDataInput = bodyInput.clientDataInput;

        // Validation
        if (datasourceInput == null  ||  datasourceInput == undefined) {
            debugDev(moduleName + ": " + 'Error: input datasourceInput variable is empty');
            return res.json(
                createErrorObject(
                    "error",
                    "Error: input datasourceInput variable is empty",
                    null
                )
            );
        };
        if (clientDataInput == null) {
            debugDev(moduleName + ": " + 'Error: input clientDataInput variable is empty')
            return res.json(
                createErrorObject(
                    "error",
                    "Error: input clientDataInput variable is empty",
                    null
                )
            );
        };

        // Update DB
        datasourceModel.findOneAndUpdate(
            { id: datasourceInput.id },
            datasourceInput).then(datasourceAdded => {

                // Error if not found
                if (datasourceAdded == null) {
                    debugDev(moduleName + ": " + 'Error updating record for datasource: ' + datasourceInput.id)
                    return res.json(
                        createErrorObject(
                            "error",
                            "Error: Could not find record for datasource: " + datasourceInput.id,
                            null
                        )
                    );
                };

                debugDev(moduleName + ": " + 'Initialise dataCachingTableArray ...')
                dataCachingTableArray = dataCachingTableVariable.get();

                // Safeguard
                if (dataCachingTableArray == null) {
                    dataCachingTableArray = [];
                };

                // Reset the expiryDateTime, so that the next read is from the DB (and not cache)
                let dataCachingTableIndex = dataCachingTableArray.findIndex(dc => dc.key == 'datasources')
                if (dataCachingTableIndex >= 0) {
                    dataCachingTableArray[dataCachingTableIndex].serverExpiryDateTime = new Date();
                    debugDev(moduleName + ": " + 'Resource ' + resource + ' serverExpiryDateTime updated in Caching Table');
                };

                debugDev(moduleName + ": " + 'Datasource record updated in canvasDatasourceRouter for ID: ' + datasourceInput.id);
 
                // Add Data - for now we use the same id: DS - dSet - Data
                clientDataInput.id = datasourceAdded.id;

                if (datasourceAdded.createMethod == 'directFileCSV'){
                    debugDev(moduleName + ": " + 'Start createMethod directFileCSV');
                    
                    // let dataAdd = new clientDataModel(clientDataInput);
                    // dataAdd.save()
                    //     .then(clientDataAdded => {

                    clientDataModel.findOneAndUpdate(
                        { id: clientDataInput.id },
                        clientDataInput).then(clientDataAdded => {
            
                            // Error if not found
                            if (clientDataAdded == null) {
                                debugDev(moduleName + ": " + 'Error updating record for datasource: ' + datasourceInput.id)
                                return res.json(
                                    createErrorObject(
                                        "error",
                                        "Error: Could not find record for clientData: " + datasourceInput.id,
                                        null
                                    )
                                );
                            };

                            debugDev(moduleName + ": " + 'ClientData record updated in canvasDatasourceRouter', clientDataInput.id , clientDataAdded.data[0]);

                            // Return
                            return res.json(
                                createReturnObject(
                                    "success",
                                    "canvasDatasource",
                                    "Updated ALL records for datasource, ID: " + datasourceAdded.id,
                                    [],
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

                            debugDev(moduleName + ": " + 'Error updating record for datasource: ' + datasourceInput.id, err)
                            return res.json(
                                createErrorObject(
                                    "error",
                                    "Error: Could not update record for datasource: " + datasourceInput.id,
                                    err
                                )
                            );
                        });
    
                };

                if (datasourceAdded.createMethod == 'directSQLEditor') {
                    debugDev(moduleName + ": " + 'Start createMethod directSQLEditor');

                    if (serverType == constants.SERVER_MYSQL) {
                        debugData(moduleName + ": " + 'MysQL connector not Activated');
                        return res.json(
                            createErrorObject(
                                "error",
                                "MysQL connector not Activated",
                                null
                            )
                        );
                    };
                    if (serverType == constants.SERVER_MICROSOFT_SASS) {
                        debugData(moduleName + ": " + 'Microsoft SSAS connector not Activated');
                        return res.json(
                            createErrorObject(
                                "error",
                                "MicrosoftSSAS connector not Activated",
                                null
                            )
                        );
                    };
                    if (serverType == constants.SERVER_POSTGRESS) {
                        debugData(moduleName + ": " + 'Error PostgresSQL connector not Activated');
                        return res.json(
                            createErrorObject(
                                "error",
                                "PostgresSQL connector not Activated",
                                null
                            )
                        );
                    };
                    if (serverType == constants.SERVER_SQLITE) {
                        debugData(moduleName + ": " + 'Error SQLite connector not Activated')
                        return res.json(
                            createErrorObject(
                                "error",
                                "SQLite connector not Activated",
                                null
                            )
                        );
                    };
                    if (serverType == constants.SERVER_ORACLE) {
                        debugData(moduleName + ": " + 'Error Oracle connector not Activated')
                        return res.json(
                            createErrorObject(
                                "error",
                                "Oracle connector not Activated",
                                null
                            )
                        );
                    };
                    if (serverType == constants.SERVER_MONGO) {
                        debugData(moduleName + ": " + 'Mongo connector not Activated')
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
                        debugDev(moduleName + ": " + 'Start Microsoft SQL connector');
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

                            debugDev(moduleName + ": " + 'New ClientData record added via Microsoft SQL in canvasDatasourceRouter');

                            // Return
                            return res.json(
                                createReturnObject(
                                    "success",
                                    "canvasDatasource",
                                    "Added ALL records for datasource, ID: " + datasourceAdded.id,
                                    {
                                            datasource: datasourceAdded,
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

                            debugDev(moduleName + ": " + 'Error Adding new ClientData', err)
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
                debugDev(moduleName + ": " + 'Error Adding new Datasource', err)
                return res.json(
                    createErrorObject(
                        "error",
                        "Error: Could not add record for datasource: " + datasourceInput.id,
                        err
                    )
                );
            });
    } catch (error) {
        debugDev(moduleName + ": " + 'canvasDatasource.POST Error: ', error)
        return res.json(
            createErrorObject(
                "error",
                "Error: Could not add record for datasource: " + datasourceInput.id,
                error
            )
        );
    };
    
})


// POST route
router.post('/', (req, res, next) => {
    const startPos = module.id.lastIndexOf("/");
    if (startPos > 0  &&  startPos < module.id.length) {
        moduleName = module.id.substring(startPos + 1);
    };

    debugDev(moduleName + ": " + '## --------------------------');
    debugDev(moduleName + ": " + '## POST Starting with canvasDatasources with query:', req.query);

    // Try
    try {
        // Get the model dynamically
        const datasourceModel = require(datasourceSchema);
        const clientDataModel = require(clientDataSchema);

        const bodyInput = JSON.parse(JSON.stringify(req.body))
        const datasourceInput = bodyInput.datasourceInput;
        const clientDataInput = bodyInput.clientDataInput;

        // Validation
        if (datasourceInput == null  ||  datasourceInput == undefined) {
            debugDev(moduleName + ": " + 'Error: input datasourceInput variable is empty');
            return res.json(
                createErrorObject(
                    "error",
                    "Error: input datasourceInput variable is empty",
                    null
                )
            );
        };
        if (clientDataInput == null) {
            debugDev(moduleName + ": " + 'Error: input clientDataInput variable is empty')
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

                debugDev(moduleName + ": " + 'Initialise dataCachingTableArray ...')
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

                debugDev(moduleName + ": " + 'New Datasource record added in canvasDatasourceRouter for ID: ' + datasourceAdded.id);
 
                    // Add Data - for now we use the same id: DS - dSet - Data
                    clientDataInput.id = datasourceAdded.id;

                    if (datasourceAdded.createMethod == 'directFileCSV'){
                        debugDev(moduleName + ": " + 'Start createMethod directFileCSV');
                        
                        let dataAdd = new clientDataModel(clientDataInput);
                        dataAdd.save()
                            .then(clientDataAdded => {

                                debugDev(moduleName + ": " + 'New ClientData record added in canvasDatasourceRouter');

                                // Return
                                return res.json(
                                    createReturnObject(
                                        "success",
                                        "canvasDatasource",
                                        "Added ALL records for datasource, ID: " + datasourceAdded.id,
                                        {
                                                datasource: datasourceAdded,
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

                                debugDev(moduleName + ": " + 'Error Adding new ClientData', err)
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
                        debugDev(moduleName + ": " + 'Start createMethod directSQLEditor');

                        if (serverType == constants.SERVER_MYSQL) {
                            debugData(moduleName + ": " + 'MysQL connector not Activated');
                            return res.json(
                                createErrorObject(
                                    "error",
                                    "MysQL connector not Activated",
                                    null
                                )
                            );
                        };
                        if (serverType == constants.SERVER_MICROSOFT_SASS) {
                            debugData(moduleName + ": " + 'Microsoft SSAS connector not Activated');
                            return res.json(
                                createErrorObject(
                                    "error",
                                    "MicrosoftSSAS connector not Activated",
                                    null
                                )
                            );
                        };
                        if (serverType == constants.SERVER_POSTGRESS) {
                            debugData(moduleName + ": " + 'Error PostgresSQL connector not Activated');
                            return res.json(
                                createErrorObject(
                                    "error",
                                    "PostgresSQL connector not Activated",
                                    null
                                )
                            );
                        };
                        if (serverType == constants.SERVER_SQLITE) {
                            debugData(moduleName + ": " + 'Error SQLite connector not Activated')
                            return res.json(
                                createErrorObject(
                                    "error",
                                    "SQLite connector not Activated",
                                    null
                                )
                            );
                        };
                        if (serverType == constants.SERVER_ORACLE) {
                            debugData(moduleName + ": " + 'Error Oracle connector not Activated')
                            return res.json(
                                createErrorObject(
                                    "error",
                                    "Oracle connector not Activated",
                                    null
                                )
                            );
                        };
                        if (serverType == constants.SERVER_MONGO) {
                            debugData(moduleName + ": " + 'Mongo connector not Activated')
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
                            debugDev(moduleName + ": " + 'Start Microsoft SQL connector');
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

                                debugDev(moduleName + ": " + 'New ClientData record added via Microsoft SQL in canvasDatasourceRouter');

                                // Return
                                return res.json(
                                    createReturnObject(
                                        "success",
                                        "canvasDatasource",
                                        "Added ALL records for datasource, ID: " + datasourceAdded.id,
                                        {
                                                datasource: datasourceAdded,
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

                                debugDev(moduleName + ": " + 'Error Adding new ClientData', err)
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
                debugDev(moduleName + ": " + 'Error Adding new Datasource', err)
                return res.json(
                    createErrorObject(
                        "error",
                        "Error: Could not add record for datasource: " + datasourceInput.id,
                        err
                    )
                );
            });
                
    } catch (error) {
        debugDev(moduleName + ": " + 'canvasDatasource.POST Error: ', error)
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