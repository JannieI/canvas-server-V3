// Connector for Microsoft SQL database, and executes given SQL Statement

const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const debugDev = require('debug')('app:dev');
const debugData = require('debug')('app:data');
const createErrorObject = require('../utils/createErrorObject.util');
const createReturnObject = require('../utils/createReturnObject.util');
const metaDataFromSource = require('./mysql.metaDataFromSource.datalayer');

// TODO - sort metaDataFromSource for MICROSOFT ...

module.exports = function execQueryMicrosoftSQL(queryObject) {
    // Runs given sqlStatement and returns data
    // Inputs: REQ.QUERY OBJECT

    return new Promise((resolve, reject) => {

        var results = [];       // To be returned to Workstation.  Remember, could be reduced by nrRowsToReturn
        var buffer = [];        // Temp buffer to accumulate, then write to DB
        
        const startPos = module.id.lastIndexOf("/");
        if (startPos > 0  &&  startPos < module.id.length) {
            moduleName = module.id.substring(startPos + 1);
        };

        debugData(moduleName + ": " + 'Start execQueryMicrosoftSQL');
        // Set & extract the vars from the Input Params
        let serverName = queryObject.serverName;
        let databaseName = queryObject.databaseName;
        let sqlStatement = queryObject.sqlStatement;
        let port = queryObject.port;
        let username = queryObject.username;
        let password = queryObject.password;
        let datasourceID = queryObject.datasourceID;      // Note, if no id given, not cached to Server
        let idMongo = null;
        let nrRowsToReturn = queryObject.nrRowsToReturn;
        if (nrRowsToReturn == null) {
            nrRowsToReturn = 0;         // Return all the rows
        };

        // Add empty record
        if (datasourceID != null) {
            // Get the model
            const clientDataSchema = '../models/clientData.model';
            const clientDataModel = require(clientDataSchema);

            // Find and Update DB
            clientDataModel.findOneAndUpdate(
                { id: datasourceID },
                {
                    id: datasourceID,
                    data: []
                },
                {
                    upsert:true,
                    new: true
                }).then(doc => {
                    if (doc != null) {
                        idMongo = doc._id;
                    };

                    debugDev(moduleName + ": " + 'execQueryMicrosoftSQL upserted ID: ', datasourceID, idMongo)
                });
        };

        // TODO - figure out how to treat SQL Parameters, ie @LogicalBusinessDay
        let sqlParameters = '';
        debugDev(moduleName + ": " + 'Properties received:', serverName, databaseName, sqlStatement,
            port, username, password, nrRowsToReturn, datasourceID);

        // Create connection string information.  Note: Azure needs encrypt: true
        var config = {
            server: serverName,
            options: {
                database: databaseName,
                encrypt: false,
                dateFormat: "ymd"
            },
            authentication: {
                type: "default",
                options: {
                    userName: username,
                    password: password,
                }
            }
        };

        // Create a connection the the DB using the config
        const connection = new Connection(config);
        connection.on('connect', function(err) {

            if (err) {
                debugDev(moduleName + ": " + 'Error in connection.on', err)
                return reject({
                    "statusCode": "error",
                    "message" : "Error in connection.on in microsoftSQL.execQuery.datalayer getting info from MS-SQL",
                    "data": null,
                    "error":err
                });
            };
    
            // Reset the data, and execute the SQL
            results = [];
            getSqlData();
            
        });

        // Connection Events
        // TODO - in time, we may not need all of these
        connection.on('end', function() {
            debugDev(moduleName + ": " + 'END -----------------------------')
        })

        connection.on('error', function(err) {
            debugDev(moduleName + ": " + 'ERROR -----------------------------')
        })

        connection.on('debug', function(text) {
            debugDev(moduleName + ": " + 'DEBUG -----------------------------', text)
        })

        connection.on('infoMessage', function(info) {
            debugDev(moduleName + ": " + 'INFO -----------------------------', info)
        })

        var Request = require('tedious').Request;

        function getSqlData() {
            debugDev(moduleName + ": " + 'Getting data from SQL');
            
            // request = new Request("SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE';",
            request = new Request(sqlStatement,
                function(err, rowCount, rows) {
                if (err) {
                    debugData(moduleName + ": " + '  microsoftSQL.datalayer Error in getSqlData', err)
                    return reject(createErrorObject(
                        "error",
                        "Error in getSqlData getting data from MicrosoftSQL" + err.sqlMessage,
                        err
                    ));
                } else {
                    // TODO - not sure why we need a function call here, but rows are empty here
                    processResult();
                };
            });

            // Proces results for each Row
            request.on('row', function(columns) {
                var row = {};
                columns.forEach(function(column) {
                    row[column.metadata.colName] = column.value;
                });
                if (nrRowsToReturn == 0  ||  results.length < nrRowsToReturn) {
                    results.push(row);
                };

                // Accummulate
                buffer.push(row);
                let recordsToInsert = [];
                let insertSize = 8000;

                // TODO - later pack in batches to speed up
                if (buffer.length % insertSize == 0) {
                    recordsToInsert = buffer.splice(0, buffer.length);
                    buffer = [];
                };

                // Cached to DB if so requested
                if (idMongo != null  &&  recordsToInsert.length > 0) {

                    // Get the model
                    const clientDataSchema = '../models/clientData.model';
                    const clientDataModel = require(clientDataSchema);

                    // Find and Update DB
                    clientDataModel.update(
                        { _id: idMongo },
                        { $push: { data: recordsToInsert } },
                        function (error, success) {
                              if (error) {
                                  console.log(error);
                              } else {
                                  console.log(success);
                              }
                        }
                    );;
                };
            });

            request.on('done', function(rowCount, more) {
                debugDev(moduleName + ": " + 'DONE -----------------------------', rowCount)
            });
    
            // Execute SQL
            connection.execSql(request);
        }

        function processResult(){
            debugDev(moduleName + ": " + 'Start processResult');

            // Cached to DB if so requested
            if (idMongo != null  &&  buffer.length > 0) {

                // Get the model
                const clientDataSchema = '../models/clientData.model';
                const clientDataModel = require(clientDataSchema);

                // Find and Update DB
                clientDataModel.update(
                    { _id: idMongo },
                    { $push: { data: buffer } },
                    function (error, success) {
                            if (error) {
                                console.log(error);
                            };
                    }
                );
            };
            
            // Return results with metadata according to the CanvasHttpResponse interface
            return resolve(createReturnObject(
                "success",
                "microsoftSQLexecQuery",
                "Ran query ' + sqlStatement + ' for database : " + databaseName + ' on ' + serverName,
                results,
                serverName,
                "MicrosoftSQL",
                databaseName,
                sqlStatement,
                null,
                results.length,
                '',  //metaDataFields,
                null
            ));                
        }

    })
}

