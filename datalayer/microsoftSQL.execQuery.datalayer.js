// Connector for Microsoft SQL database, and executes given SQL Statement

const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const debugDev = require('debug')('app:dev');
const debugData = require('debug')('app:data');
const createErrorObject = require('../utils/createErrorObject.util');
const createReturnObject = require('../utils/createReturnObject.util');
const metaDataFromSource = require('./mysql.metaDataFromSource.datalayer');

var rows = [];

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

        // TODO - figure out how to treat SQL Parameters, ie @LogicalBusinessDay
        let sqlParameters = '';
        debugDev('Properties received:', serverName, databaseName, sqlStatement,
            port, username, password);

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

        const connection = new Connection(config);

        connection.on('connect', function(err) {
            //Add error handling here   
            if (err) {
                if (err) {
                    console.log('Error in connection.on', err)
                    return reject({
                        "statusCode": "error",
                        "message" : "Error in connection.on in microsoftSQL.execQuery.datalayer getting info from MS-SQL",
                        "data": null,
                        "error":err
                    });
                };
    

            }
            rows = [];
            getSqlData();
            
        });

        connection.on('end', function(err) {
            console.log('END -----------------------------')
        })

        connection.on('error', function(err) {
            console.log('ERROR -----------------------------')
        })

        connection.on('debug', function(text) {
            console.log('DEBUG -----------------------------', text)
        })

        connection.on('infoMessage', function(info) {
            console.log('INFO -----------------------------', info)
        })

        var Request = require('tedious').Request;

        function getSqlData() {
            console.log('Getting data from SQL');
            
            // request = new Request("SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE';",
            request = new Request(sqlStatement,
                function(err, rowCount, rows) {
                if (err) {
                    debugData('  mySQL.datalayer Error in getConnection', err)
                    return reject(createErrorObject(
                            "error",
                            "Error in .query getting data from MySQL" + err.sqlMessage,
                            err
                        )
                    );
            } else {
                    console.log('rows', rows.length)
                    processResult();
                }
            });
            request.on('row', function(columns) {
                var row = {};
                columns.forEach(function(column) {
                    row[column.metadata.colName] = column.value;
                });
                rows.push(row);
            });
                request.on('done', function(rowCount, more) {
                    console.log(rowCount + ' rows returned');

                });
            connection.execSql(request);
        }

        function processResult(){
            console.log('Start processResult');

            // Return results with metadata according to the CanvasHttpResponse interface
            return resolve(createReturnObject(
                "success",
                "Ran query ' + sqlStatement + ' for database : " + databaseName + ' on ' + serverName,
                rows,
                serverName,
                "MicrosoftSQL",
                databaseName,
                sqlStatement,
                null,
                rows.length,
                '',  //metaDataFields,
                null
            ));                
        }

    })
}

