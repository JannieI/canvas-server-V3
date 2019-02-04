// Connector for MySQL database
// This handles all DB related actions, include connecting

const mysql = require('mysql');
const config = require('config');               // Configuration
const debugDev = require('debug')('app:dev');
const debugData = require('debug')('app:data');
const calculateCacheExpiryDate = require('../utils/calculateCacheExpiryDate.util');
const metaDataFromDatasource = require('../utils/metaDataFromDatasource.util');
const sortFilterFieldsAggregate = require('../utils/sortFilterFieldsAggregate.util');
const createErrorObject = require('../utils/createErrorObject.util');
const createReturnObject = require('../utils/createReturnObject.util');

module.exports = function getClientData(datasource, queryObject) {
    // Selects the records from the MySQL database according to the given parameters.
    // Inputs: DATASOURCE, REQ.QUERY OBJECT
    return new Promise((resolve, reject) => {
        try {

            const startPos = module.id.lastIndexOf("/");
            if (startPos > 0  &&  startPos < module.id.length) {
                moduleName = module.id.substring(startPos + 1);
            };

            // Set & extract the vars from the Input Params
            // TODO - consider this as a require('') as it will be re-used
            let datasourceID = queryObject.datasourceID;
            let user = datasource.username;
            let password = datasource.password;
            let database = datasource.databaseName;
            let port = datasource.port;
            let host = datasource.serverName;
            let serverType = datasource.serverType;
            let dataTableName = datasource.dataTableName;
            let dataSQLStatement = datasource.dataSQLStatement;
            let cacheResultsOnServer = datasource.cacheResultsOnServer;

            // TODO - figure out how to treat SQL Parameters, ie @LogicalBusinessDay
            let sqlParameters = '';
            debugDev(moduleName + ": " + 'Properties read from DS id:', 
                datasource.id, 
                user, 
                password, 
                database, 
                port, 
                host, 
                dataTableName, 
                dataSQLStatement, 
                cacheResultsOnServer
            );

            // Load defaults, set in startup.sh (via custom-environment-variables.js)
            const defaultHost = config.get('mysqlLocal.startup.host');
            const defaultUser = config.get('mysqlLocal.startup.user');
            const defaultPassword = config.get('mysqlLocal.startup.password');
            const defaultDatabase = config.get('mysqlLocal.startup.database');
            const defaultPort = config.get('mysqlLocal.startup.port');

            if (host != null  &&  defaultHost != null  &&  defaultHost != '') {
                host = defaultHost;
            };
            if (user == null  &&  defaultUser != null  &&  defaultUser != '') {
                user = defaultUser;
            };
            if ((password == null  ||  password == "")  
                &&  defaultPassword != null  
                &&  defaultPassword != ''
                ) {
                password = defaultPassword;
            };
            if (database == null  &&  defaultDatabase != null  &&  defaultDatabase != '') {
                database = defaultDatabase;
            };
            if (port == null  &&  defaultPort != null  &&  defaultPort != '') {
                port = defaultPort;
            };

            // TODO - how to treat special DB options
            
            // Create pool Object
            const pool = mysql.createPool({
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
                    debugData(moduleName + ": " + 'Error in mysql.getClientData.datalayer.getConnection', err)

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
                        debugData(moduleName + ": " + '  mySQL.datalayer Error in .query', err)
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
                    // TODO - consider this as a require('') later as it will be re-used
                    if (cacheResultsOnServer) {

                        // Data to upsert
                        const dataToSave = {
                            id: datasourceID,
                            data: results
                        };

                        // Get the model
                        const clientSchema = '../models/clientData.model';
                        const clientModel = require(clientSchema);
                        debugData(moduleName + ": " + 'Using Schema clientData');

                        // Find and Update DB
                        clientModel.findOneAndUpdate(
                            { id: datasourceID },
                            dataToSave,
                            {
                                upsert:true,                    // Create if it doesnot exist
                                new: true,                      // return updated doc
                                runValidators: true             // validate before update
                            })
                            .then(doc => {

                                // Only refresh if unRefreshable = false (else may only be done once)
                                if (doc == null
                                    ||
                                    datasource.unRefreshable == false
                                    ) {

                                    // Calculate serverExpiryDateTime for this Datasource
                                    const serverExpiryDateTime = calculateCacheExpiryDate(datasource);
                                    console.log ('xx srv-Exp', serverExpiryDateTime);

                                    // Deep copy
                                    let datasourceDeepCopy = JSON.parse(JSON.stringify(datasource));
                                    datasourceDeepCopy.serverExpiryDateTime = serverExpiryDateTime;

                                    // Re-save the datasource with the new serverExpiryDateTime

                                    // Get the model
                                    const clientSchema = '../models/datasources.model';
                                    const clientModel = require(clientSchema);
                                    debugData(moduleName + ": " + 'Using Schema datasource');

                                    // Find and Update DB
                                    clientModel.findOneAndUpdate(
                                        { id: datasourceID },
                                        datasourceDeepCopy,
                                        {
                                        new: true,                       // return updated doc
                                        runValidators: true              // validate before update
                                        })
                                        .then(doc => {

                                        // console.log('xx check old copy', datasource.serverExpiryDateTime, datasourceDeepCopy.serverExpiryDateTime)

                                            debugData(moduleName + ": " + 'ClientData in cached refreshed for id: ' + datasourceID);
                                        });
                                    };
                            })
                            .catch(err => {
                                debugData(moduleName + ": " + 'Error caching data from MySQL on Server', err)
                                reject({
                                    "statusCode": "error",
                                    "message" : "Error caching data from MySQL on Server",
                                    "data": null,
                                    "error":err
                                });
                            });

                    };

                    // Extract the Widget specific data (sort, filter, fields, aggregate)
                    let afterSort;
                    afterSort =  sortFilterFieldsAggregate(results, queryObject);

                    // Return if an Error
                    if (afterSort.error) {
                        debugData(moduleName + ": " + 'Error in the sortFilterFieldsAggregate routine', afterSort.error)
                        // reject({
                        //     "statusCode": "error",
                        //     "message" : "Error in the sortFilterFieldsAggregate routine",
                        //     "data": null,
                        //     "error": error
                        // });
                        reject( createErrorObject("error",
                            "Error in the sortFilterFieldsAggregate routine", afterSort.error));
                    };

                    // Update results with this information
                    if (afterSort.results == null) {
                        results = [];
                    } else {
                        results = afterSort.results;
                    };

                    //  Count
                    let nrRecordsReturned = 0;
                    if (results != null) {
                        nrRecordsReturned = results.length;
                    };

                    // Collect MetaData
                    var fields = [];
                    fields = metaDataFromDatasource(datasource, queryObject);
                    let tableName = datasource.dataTableName;
                    if (datasource.dataSQLStatement != "") {
                        tableName = 'SQL Statement';
                    };

                    // Return results with metadata according to the CanvasHttpResponse interface
                    resolve(createReturnObject(
                        "success",
                        "Retrieved data for id: " + datasourceID,
                        results,
                        host,
                        serverType,
                        dataTableName,
                        null,
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
                "message" : "Error in TRY block in mysql.getClientData.datalayer getting data from MySQL",
                "data": null,
                "error":error
            });
        };
    });

}
