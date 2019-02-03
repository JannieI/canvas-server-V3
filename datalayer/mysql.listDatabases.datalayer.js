// Connector for MySQL database, and returns a list of Databases for a given Server

const mysql = require('mysql');
const debugDev = require('debug')('app:dev');
const debugData = require('debug')('app:data');
const createErrorObject = require('../utils/createErrorObject.util');
const createReturnObject = require('../utils/createReturnObject.util');

module.exports = function listDatabases(queryObject) {
    // Selects a list of Databases for a given Server in a MySQL database
    // Inputs: REQ.QUERY OBJECT
    return new Promise((resolve, reject) => {
        
        try {

            const startPos = module.id.lastIndexOf("/");
            if (startPos > 0  &&  startPos < module.id.length) {
                moduleName = module.id.substring(startPos + 1);
            };

            // Set & extract the vars from the Input Params
            let serverName = queryObject.serverName;
            let databaseName = queryObject.databaseName;
            let port = queryObject.port;
            let username = queryObject.username;
            let password = queryObject.password;
            let dataSQLStatement = "SHOW DATABASES";

            let sqlParameters = '';
            debugDev(moduleName + ": " + 'Properties received:', serverName, databaseName, port, username, password);

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
                    debugData('Error in mysql.listDatabases.datalayer.getConnection', err)

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
                            "Error in mysql.listDatabases.datalayer.getConnection getting data from MySQL",
                            err
                        )
                    );
                };

                // Make the query
                connection.query(dataSQLStatement, [sqlParameters], (err, returnedData) => {
                    if (err) {
                        debugData('  mySQL.datalayer Error in getConnection', err)
                        return reject(createErrorObject(
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

                    // Turn into single array (just DB names)
                    results = results.map( x => x['Database']);

                    // Return results with metadata according to the CanvasHttpResponse interface
                    return resolve(createReturnObject(
                        "success",
                        "Retrieved Databases for Server : " + serverName,
                        results,
                        serverName,
                        "MySQL",
                        "",
                        null,
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
                "message" : "Error in TRY block in mysql.listDatabases.datalayer getting info from MySQL",
                "data": null,
                "error":error
            });
        };
    });

}
