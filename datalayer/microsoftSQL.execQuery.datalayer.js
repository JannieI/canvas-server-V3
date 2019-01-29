// Connector for Microsoft SQL database, and executes given SQL Statement

const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const debugDev = require('debug')('app:dev');
const debugData = require('debug')('app:data');
const createErrorObject = require('../utils/createErrorObject.util');
const createReturnObject = require('../utils/createReturnObject.util');
const metaDataFromSource = require('./mysql.metaDataFromSource.datalayer');

// TODO - sort metaDataFromSource for MICROSOFT ...

var results = [];

module.exports = function execQueryMicrosoftSQL(queryObject) {
    // Runs given sqlStatement and returns data
    // Inputs: REQ.QUERY OBJECT
    return new Promise((resolve, reject) => {

        debugData('Start execQueryMicrosoftSQL');
        // Set & extract the vars from the Input Params
        let serverName = queryObject.serverName;
        let databaseName = queryObject.databaseName;
        let sqlStatement = queryObject.sqlStatement;
        let port = queryObject.port;
        let username = queryObject.username;
        let password = queryObject.password;
        let datasourceID = queryObject.datasourceID;      // Note, if no id given, not cached to Server
        let idMongo = null;

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
                {upsert:true}).then(doc => {
                    idMongo = doc._id;
                    debugDev('upserted', idMongo, doc)
                });
        };

        // TODO - figure out how to treat SQL Parameters, ie @LogicalBusinessDay
        let sqlParameters = '';
        debugDev('Properties received:', serverName, databaseName, sqlStatement,
            port, username, password);

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
                debugDev('Error in connection.on', err)
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
            debugDev('END -----------------------------')
        })

        connection.on('error', function(err) {
            debugDev('ERROR -----------------------------')
        })

        connection.on('debug', function(text) {
            // debugDev('DEBUG -----------------------------', text)
        })

        connection.on('infoMessage', function(info) {
            // debugDev('INFO -----------------------------', info)
        })

        var Request = require('tedious').Request;

        function getSqlData() {
            debugDev('Getting data from SQL');
            
            // request = new Request("SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE';",
            request = new Request(sqlStatement,
                function(err, rowCount, rows) {
                if (err) {
                    debugData('  microsoftSQL.datalayer Error in getSqlData', err)
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
                console.log('xx got row ')
                columns.forEach(function(column) {
                    row[column.metadata.colName] = column.value;
                });
                results.push(row);
                if (results.length % 3 == 0) {
                    console.log('xx % 3')
                };

                // Cached to DB if so requested
                if (idMongo != null  &&  results.length > 0) {

                    // Get the model
                    const clientDataSchema = '../models/clientData.model';
                    const clientDataModel = require(clientDataSchema);

                    // Find and Update DB
                    clientDataModel.update(
                        { _id: idMongo },
                        { $push: { data: results[results.length - 1] } },
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
                debugDev('DONE -----------------------------', rowCount)
            });
    
            // Execute SQL
            connection.execSql(request);
        }

        function processResult(){
            debugDev('Start processResult');

            // Return results with metadata according to the CanvasHttpResponse interface
            return resolve(createReturnObject(
                "success",
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

