// Connector for MySQL database, and executes given SQL Statement

const mysql = require('mysql');
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
                    debugData('Error in mysql.execQuery.datalayer.getConnection', err)

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

                    return reject(
                        createErrorObject(
                            "error",
                            "Error in mysql.execQuery.datalayer.getConnection getting data from MySQL " + err.sqlMessage,
                            err
                        )
                    );
                };

                // Make the query 
                connection.query(sqlStatement, [], (err, returnedData) => {
                    if (err) {
                        debugData('  mySQL.datalayer Error in getConnection', err)
                        return reject(createErrorObject(
                                "error",
                                "Error in .query getting data from MySQL" + err.sqlMessage,
                                err
                            )
                        );
                    };

                    //  Now, results = [data]
                    debugData('  mySQL.datalayer got data');
                    results = JSON.parse(JSON.stringify(returnedData));
                    if (results == null) {
                        results = [];
                    };

                    //  Count
                    let nrRecordsReturned = 0;
                    nrRecordsReturned = results.length;

                    // Get metaData
                    let metaDataFields = [];
                    if (results.length > 1) {
                        metaDataFields = metaDataFromSource(results[0]);
                    };

                    // Return results with metadata according to the CanvasHttpResponse interface
                    return resolve(createReturnObject(
                        "success",
                        "Ran query ' + sqlStatement + ' for database : " + databaseName + ' on ' + serverName,
                        results,
                        serverName,
                        "MySQL",
                        databaseName,
                        sqlStatement,
                        null,
                        nrRecordsReturned,
                        null,
                        null
                    ));

                });
            });
        }
        catch (error) {
            return reject({
                "statusCode": "error",
                "message" : "Error in TRY block in mysql.execQuery.datalayer getting info from MySQL",
                "data": null,
                "error":error
            });
        };
    });

}
