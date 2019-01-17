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
        const serverExpiryDateTime = datasource.serverExpiryDateTime
        const dataFields = datasource.dataFields;
        const dataFieldTypes = datasource.dataFieldTypes;
        const dataFieldLengths = datasource.dataFieldLengths;

        // Create databaseObject - passing one Object makes it easier to add new properties
        // Sample: databaseObject = { host: '127.0.0.1', user: 'janniei', password: 'janniei', database: 'mysql'}
        let databaseObject =
            {
                host: serverName,
                user: username,
                password: password,
                database: databaseName,
                port: port
        };

        // Query properties: these are used by the Widget to reduce the data block returned
        let sortObject = queryObject.sortObject;
        let fieldsObject = queryObject.fields;

        if (fieldsObject != null) {
            fieldsObject = JSON.parse(JSON.stringify(fieldsObject));
        };
        let filterObject = queryObject.filterObject;
        const aggregationObject = queryObject.aggregationObject;

        // TODO - figure out to store and how to use Parameters
        let sqlParameters = '';

        // Set results = [] (data block to return to Workstation)
        results = [];

        debugDev('Properties read from DS id:', datasource.id, username, password, databaseName, port, serverType, serverName, dataTableName, dataSQLStatement, cacheResultsOnServer)

        // 2. Connect to the MySQL DB and return the data
        results = [];



        let a = new Date()
        let ietsie = isDateInFuture(isDateInFuture)
        console.log('ietsie', ietsie)




        connectAndQuery(databaseObject, dataTableName, fieldsObject, dataSQLStatement, sqlParameters)
            .then(returnedData => {

                //  Now, results = [data], with Count
                results = JSON.parse(JSON.stringify(returnedData));
                let nrRecordsReturned = 0;
                if (results != null) {
                    nrRecordsReturned = results.length;
                };

                // TODO - later
                // 3. Do the Transformations according to the Tr loaded in step 1

                // 4. Store the data in Canvas ClientData if cachable
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

                // 5. Extract the Widget specific data (sort, filter, fields, aggregate)
                let afterSort;
                afterSort =  sortFilterFieldsAggregate(results, req.query);

                // Return if an Error
                if (afterSort.error) {
                    return res.status(400).json({
                        "statusCode": "error",
                        "message" : "Error in the sortFilterFieldsAggregate routine",
                        "data": null,
                        "error": error
                    });
                };

                // 6. Update results with this information
                results = afterSort.results;

                // 7. Collect MetaData
                var fields = [];
                fields = metaDataFromDatasource(datasource);

                // 8. Return results with metadata according to the CanvasHttpResponse interface
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
            })
            .catch(err =>{
                // If any error, return err according to the CanvasHttpResponse interface
                console.error('Err after datalayer.select called from clientData.router', err);
                reject({
                    "statusCode": "error",
                    "message" : "Error: Err after datalayer.select called from clientData.router for id:", id,
                    "data": null,
                    "error": err
                });
            });

    });

}
