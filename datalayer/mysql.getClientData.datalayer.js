// Connector for MySQL database
// This handles all DB related actions, include connecting

// Some Docs on how to handle MySQL

    // Ubuntu
        // - to see if running: systemctl status mysql.service
        // - to get running again:
        //      systemctl unmask mysql.service
        //      service mysql start
        //
        // If permissions issues:
        // - sudo /etc/init.d/mysql start
        // - sudo /etc/init.d/mysql restart
        // - sudo systemctl start mysql
        //
        // To see if running, etc:
        // - service mysql status
        // - service mysql stop
        // - service mysql start
        //
        // MySQL defaults to port 3306 unless you specify another line in the /etc/my.cnf config file.
        // To change it:
        // - Log in to your server using SSH.
        // - At the command prompt, use your preferred text editor to open the /etc/mysql/my.cnf file.
        //   ie vi /etc/my.cnf
        // - Locate the bind-address line in the my.cnf file.
        //
        // Alter Password with
        // - ALTER USER 'userName'@'localhost' IDENTIFIED BY 'New-Password-Here';


const mysql = require('mysql');
const config = require('config');               // Configuration
const debugDev = require('debug')('app:dev');
const connectAndQuery = require('./mysql.connectAndQuery.datalayer');
const isDateInFuture = require('../utils/dateFunctions');

module.exports = function getClientData(datasource, queryObject) {
    // Gets (Selects) the data; either from cache or from Source
    // Inputs: DATASOURCE (for which to get the data), QUERYOBJECT provided by HTTP GET request

    // Selects the records from the MySQL database according to the given parameters.
    // Inputs: DATABASE_OBJECT, TABLE, FIELDS, QUERY_STRING, SQL_PARAMETERS

    return new Promise((resolve, reject) => {

        // 1. Set vars & Extract the vars from the Input Params
        const username = datasource.username;
        const password = datasource.password;
        const databaseName = datasource.databaseName;
        const port = datasource.port;
        const serverType = datasource.serverType;
        const serverName = datasource.serverName;
        const dataTableName = datasource.dataTableName;
        const dataSQLStatement = datasource.dataSQLStatement;
        const cacheResultsOnServer = datasource.cacheResultsOnServer;

        // Set results = [] (data block to return to Workstation)
        results = [];

        debugDev('Properties read from DS id:', datasource.id, username, password, databaseName, port, serverType, serverName, dataTableName, dataSQLStatement, cacheResultsOnServer)

        // Load defaults, set in startup.sh (via custom-environment-variables.js)
        let defaultHost = config.get('mysqlLocal.startup.host');
        let defaultUser = config.get('mysqlLocal.startup.user');
        let defaultPassword = config.get('mysqlLocal.startup.password');
        let defaultDatabase = config.get('mysqlLocal.startup.database');
        let defaultPort = config.get('mysqlLocal.startup.port');

        if (defaultHost != null  &&  defaultHost != '') {
            host = defaultHost;
        };
        if (defaultUser != null  &&  defaultUser != '') {
            user = defaultUser;
        };
        if (defaultPassword != null  &&  defaultPassword != '') {
            password = defaultPassword;
        };
        if (defaultDatabase != null  &&  defaultDatabase != '') {
            database = defaultDatabase;
        };
        if (defaultPort != null  &&  defaultPort != '') {
            port = defaultPort;
        };

        // TODO - how to treat special DB options

        // Create pool Object
        const pool = mysql.createPool({
            connectionLimit  : 10,
            host             : host,
            user             : user,
            password         : password,
            database         : database,
            port             : port,
            connectionLimit  : 10,
            supportBigNumbers: true
        });

        // Connect to DB and get the Data
        results = [];
        pool.getConnection((err, connection) => {
            console.log('  mySQL.datalayer getConnection Start')
            if (err) {
                console.log('  mySQL.datalayer Error in getConnection', err)
                reject({
                    "statusCode": "error",
                    "message" : "Error in getConnection getting data from MySQL",
                    "data": null,
                    "error":err
                });
            };
            console.log('  mySQL.datalayer After getConnection ')

            // Make the query
            connection.query(queryString, [sqlParameters], (err, results) => {
                console.log('  mySQL.datalayer After query')
                if (err) {
                    console.log('  mySQL.datalayer Error in query', err)
                    console.log('  mySQL.datalayer Error in getConnection', err)
                    reject({
                        "statusCode": "error",
                        "message" : "Error in .query getting data from MySQL",
                        "data": null,
                        "error":err
                    });
                };

                //  Now, results = [data], with Count
                results = JSON.parse(JSON.stringify(returnedData));
                let nrRecordsReturned = 0;
                if (results != null) {
                    nrRecordsReturned = results.length;
                };

                // TODO - later
                // Do the Transformations according to the Tr loaded in step 1

                // Store the data in Canvas ClientData if cachable
                // If cacheResultsOnServer = True, then Insert the data into Canvas Server cache (in Mongo)
                // NB: this is NOT done Async, so will work in background
                if (cacheResultsOnServer) {

                    // Data to upsert
                    const dataToSave = {
                        id: datasourceID,
                        data: results
                    };

                    // Get the model
                    const clientSchema = '../models/clientData.model';
                    const clientModel = require(clientSchema);
                    debugData('Using Schema clientData');

                    // Store in Canvas DB
                    clientModel.updateMany(
                        { id: datasourceID },
                        dataToSave,
                        { upsert: true }, (err, updateStats) => {

                            if(err){

                                // Return an error
                                reject({
                                    "statusCode": "error",
                                    "message" : "Error caching data from MySQL on Server",
                                    "data": null,
                                    "error":err
                                });
                            };
                        }
                    );
                };

                // Extract the Widget specific data (sort, filter, fields, aggregate)
                let afterSort;
                afterSort =  sortFilterFieldsAggregate(results, req.query);

                // Return if an Error
                if (afterSort.error) {
                    reject({
                        "statusCode": "error",
                        "message" : "Error in the sortFilterFieldsAggregate routine",
                        "data": null,
                        "error": error
                    });
                };

                // Update results with this information
                results = afterSort.results;

                // Collect MetaData
                var fields = [];
                fields = metaDataFromDatasource(datasource);

                // Return results with metadata according to the CanvasHttpResponse interface
                resolve({
                    "statusCode": "success",
                    "message" : "Retrieved data for id:" + id,
                    "data": results,
                    "metaData": {
                        "table": {
                            "tableName": "", //oneDoc.mongooseCollection.collectionName,
                            "nrRecordsReturned": nrRecordsReturned
                        },
                        "fields": fields
                    },
                    "error": null
                });
            });
        });
    });

}
