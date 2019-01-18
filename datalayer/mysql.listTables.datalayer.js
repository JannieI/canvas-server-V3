// Connector for MySQL database
// Returns a list of tables for a given Database

const mysql = require('mysql');
const config = require('config');               // Configuration
const debugDev = require('debug')('app:dev');
const debugData = require('debug')('app:data');
const metaDataFromDatasource = require('../utils/metaDataFromDatasource.util');
const sortFilterFieldsAggregate = require('../utils/sortFilterFieldsAggregate.util');
const createErrorObject = require('../utils/createErrorObject.util');
const calculateCacheExpiryDate = require('../utils/calculateCacheExpiryDate.util');
const createReturnObject = require('../utils/createReturnObject.util');

module.exports = function listTables(datasource, queryObject) {
    // Selects the records from the MySQL database according to the given parameters.
    // Inputs: DATASOURCE, REQ.QUERY OBJECT
    return new Promise((resolve, reject) => {
        try {
            // Set & extract the vars from the Input Params
            // TODO - consider this as a require('') as it will be re-used
            let serverName = datasource.serverName;
            let databaseName = datasource.databaseName;
            let port = datasource.port;
            let username = datasource.username;
            let password = datasource.password;
            let dataSQLStatement = "SHOW TABLES";

            // TODO - figure out how to treat SQL Parameters, ie @LogicalBusinessDay
            let sqlParameters = '';
            debugDev('Properties received:', serverName, databaseName, port, username, password, )

            // Create pool Object
            const pool = mysql.createPool({
                connectionLimit  : 10,
                host             : serverName,
                user             : user,
                password         : password,
                database         : database,
                port             : port,
                connectionLimit  : 10,
                supportBigNumbers: true
            });

            // Connect to DB and get the Data
            let results = [];
            pool.getConnection((err, connection) => {

                if (err) {
                    debugData('Error in mysql.getClientData.datalayer.getConnection', err)

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

                    reject({
                        "statusCode": "error",
                        "message" : "Error in mysql.getClientData.datalayer.getConnection getting data from MySQL",
                        "data": null,
                        "error":err
                    });
                };

                // Make the query
                connection.query(dataSQLStatement, [sqlParameters], (err, returnedData) => {
                    if (err) {
                        debugData('  mySQL.datalayer Error in getConnection', err)
                        reject({
                            "statusCode": "error",
                            "message" : "Error in .query getting data from MySQL",
                            "data": null,
                            "error":err
                        });
                    };

                    //  Now, results = [data]
                    results = JSON.parse(JSON.stringify(returnedData));

                    //  Count
                    let nrRecordsReturned = 0;
                    if (results != null) {
                        nrRecordsReturned = results.length;
                    };

                    // Return results with metadata according to the CanvasHttpResponse interface
                    resolve(createReturnObject(
                        "success",
                        "Retrieved data for id: " + datasourceID,
                        results,
                        tableName,
                        nrRecordsReturned,
                        fields
                    ));

                });
            });
        }
        catch (error) {
            reject({
                "statusCode": "error",
                "message" : "Error in TRY block in mysql.listTables.datalayer getting info from MySQL",
                "data": null,
                "error":error
            });
        };
    });

}
