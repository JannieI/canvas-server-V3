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
const debugData = require('debug')('app:data');
const metaDataFromDatasource = require('../utils/metaDataFromDatasource.util');
const sortFilterFieldsAggregate = require('../utils/sortFilterFieldsAggregate.util');

module.exports = function getClientData(datasource, queryObject) {
    // Selects the records from the MySQL database according to the given parameters.
    // Inputs: DATABASE_OBJECT, TABLE, FIELDS, QUERY_STRING, SQL_PARAMETERS

    return new Promise((resolve, reject) => {

        // Set vars & Extract the vars from the Input Params
        let datasourceID = datasource.datasourceID;
        let username = datasource.username;
        let password = datasource.password;
        let databaseName = datasource.databaseName;
        let port = datasource.port;
        let serverType = datasource.serverType;
        let serverName = datasource.serverName;
        let dataTableName = datasource.dataTableName;
        let dataSQLStatement = datasource.dataSQLStatement;
        let cacheResultsOnServer = datasource.cacheResultsOnServer;

        // TODO - figure out how to treat SQL Parameters, ie @LogicalBusinessDay
        let sqlParameters = '';
        debugDev('Properties read from DS id:', datasource.id, username, password, databaseName, port, serverType, serverName, dataTableName, dataSQLStatement, cacheResultsOnServer)

        // Load defaults, set in startup.sh (via custom-environment-variables.js)
        const defaultHost = config.get('mysqlLocal.startup.host');
        const defaultUser = config.get('mysqlLocal.startup.user');
        const defaultPassword = config.get('mysqlLocal.startup.password');
        const defaultDatabase = config.get('mysqlLocal.startup.database');
        const defaultPort = config.get('mysqlLocal.startup.port');

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
        let results = [];
        pool.getConnection((err, connection) => {

            if (err) {
                debugData('  mySQL.datalayer Error in getConnection', err)
                reject({
                    "statusCode": "error",
                    "message" : "Error in getConnection getting data from MySQL",
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

                // Store the data in Canvas ClientData if cachable
                // If cacheResultsOnServer = True, then Insert the data into Canvas Server cache (in Mongo)
                // NB: this is done Async but we dont wait for result, so will work in background
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
                                debugData('Error caching data from MySQL on Server', err)
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
                afterSort =  sortFilterFieldsAggregate(results, queryObject);

                // Return if an Error
                if (afterSort.error) {
                    debugData('Error in the sortFilterFieldsAggregate routine', err)
                    reject({
                        "statusCode": "error",
                        "message" : "Error in the sortFilterFieldsAggregate routine",
                        "data": null,
                        "error": error
                    });
                };

                // Update results with this information
                results = afterSort.results;

                //  Count
                results = JSON.parse(JSON.stringify(returnedData));
                let nrRecordsReturned = 0;
                if (results != null) {
                    nrRecordsReturned = results.length;
                };

                // Collect MetaData
                var fields = [];
                fields = metaDataFromDatasource(datasource);

                // Return results with metadata according to the CanvasHttpResponse interface
                resolve({
                    "statusCode": "success",
                    "message" : "Retrieved data for id:" + datasourceID,
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
