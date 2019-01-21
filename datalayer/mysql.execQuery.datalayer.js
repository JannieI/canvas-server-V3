// Connector for MySQL database, and returns a list of Fields for a given Tables

const mysql = require('mysql');
const debugDev = require('debug')('app:dev');
const debugData = require('debug')('app:data');
const createErrorObject = require('../utils/createErrorObject.util');
const createReturnObject = require('../utils/createReturnObject.util');

module.exports = function listFields(queryObject) {
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
            debugDev('Properties received:', serverName, databaseName, tableName, 
                port, username, password, dataSQLStatement);

            // Create pool Object
            const pool = mysql.createPool({
                connectionLimit  : 10,
                host             : serverName,
                user             : username,
                password         : password,
                database         : databaseName,
                port             : port,
                connectionLimit  : 10,
                supportBigNumbers: true
            });

            // Connect to DB and get the Data
            let results = [];
            pool.getConnection((err, connection) => {

                if (err) {
                    debugData('Error in mysql.listFields.datalayer.getConnection', err)

                    // MySQL Error Codes
                    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                        console.error('Database connection was closed.')
                    }
                    if (err.code === 'ER_CON_COUNT_ERROR') {
                        console.error('Database has too many connections.')
                    }
                    if (err.code === 'ECONNREFUSED') {
                        console.error('Database connection was refused.')
                    }

                    reject(
                        createErrorObject(
                            "error",
                            "Error in mysql.listFields.datalayer.getConnection getting data from MySQL",
                            err
                        )
                    );
                };

                // Make the query
                connection.query(sqlStatement, [sqlParameters], (err, returnedData) => {
                    if (err) {
                        debugData('  mySQL.datalayer Error in getConnection', err)
                        reject(createErrorObject(
                                "error",
                                "Error in .query getting data from MySQL",
                                err
                            )
                        );
                    };

                    //  Now, results = [data]
                    results = JSON.parse(JSON.stringify(returnedData));

                    //  Count
                    let nrRecordsReturned = 0;
                    if (results != null) {
                        nrRecordsReturned = results.length;
                    };

                    // TODO - create a standard field structure - for all DB types
                    
                    // Return results with metadata according to the CanvasHttpResponse interface
                    resolve(createReturnObject(
                        "success",
                        "Ran query ' + sqlStatement + ' for database : " + databaseName + ' on ' + serverName,
                        results,
                        serverName,
                        "MySQL",
                        databaseName,
                        sqlStatement,
                        nrRecordsReturned,
                        null
                    ));

                });
            });
        }
        catch (error) {
            reject({
                "statusCode": "error",
                "message" : "Error in TRY block in mysql.listFields.datalayer getting info from MySQL",
                "data": null,
                "error":error
            });
        };
    });

}
