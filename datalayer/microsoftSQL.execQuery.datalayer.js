// Connector for Microsoft SQL database, and executes given SQL Statement

const Connection = require('tedious').Connection; 
const Request = require('tedious').Request; 
const debugDev = require('debug')('app:dev');
const debugData = require('debug')('app:data');
const createErrorObject = require('../utils/createErrorObject.util');
const createReturnObject = require('../utils/createReturnObject.util');
const metaDataFromSource = require('./mysql.metaDataFromSource.datalayer');

module.exports = function execQuery(queryObject) {
    // Runs given sqlStatement and returns data
    // Inputs: REQ.QUERY OBJECT
    return new Promise((resolve, reject) => {
 
        try {
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

            // Create Connection Object
            var config = { 
                userName: "{your database user name}", 
                password: "{your database password}", 
                server: "{you database server address}", 
                options: { 
                    database: "{you database name}", 
                    encrypt: true, 
                } 
            };
            var connection = new Tedious.Connection(config);

            // Connect to DB and get the Data
            let results = [];
            // pool.getConnection((err, connection) => {
            connection.on("connect",function(err){ 
                var result = []; 
            
                var request = new Request("select * form student",function(err,count,rows){ 
                    console.log(result); 
                }); 
                request.on("row", function (columns) { 
                    var item = {}; 
                    columns.forEach(function (column) { 
                        item[column.metadata.colName] = column.value; 
                    }); 
                    result.push(item); 
                    //  Now, results = [data]
                    debugData('  microsoftSQL.datalayer got data');
                    results = JSON.parse(JSON.stringify(returnedData));
                    if (results == null) {
                        results = [];
                    };


                    // Return results with metadata according to the CanvasHttpResponse interface
                    return resolve(createReturnObject(
                        "success",
                        "Ran query ' + sqlStatement + ' for database : " + databaseName + ' on ' + serverName,
                        results,
                        serverName,
                        "MSSQL",
                        databaseName,
                        sqlStatement,
                        null,
                        0,
                        'metaDataFields',
                        null
                    ));


                }); 
            })
        }
        catch (error) {
            return reject({
                "statusCode": "error",
                "message" : "Error in TRY block in microsoftSQL.execQuery.datalayer getting info from MS-SQL",
                "data": null,
                "error":error
            });
        };
    });

}
