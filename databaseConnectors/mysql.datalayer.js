// Connector for MySQL database
// This handles all DB related actions, include connecting

// TODO - move this to a better place once we are more familiar with it
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

// exports.select = function(host, user, password, database, options, sql, sqlParams) {
exports.select = function(databaseObject, table, fields, queryString, sqlParameters) {
    // Selects the records from the MySQL database according to the given parameters.
    // Inputs: DATABASE_OBJECT, TABLE, FIELDS, QUERY_STRING, SQL_PARAMETERS

    return new Promise((resolve, reject) => {

        // Load defaults, set in startup.sh (via custom-environment-variables.js)
        let host = config.get('mysqlLocal.startup.host');
        let user = config.get('mysqlLocal.startup.user');
        let password = config.get('mysqlLocal.startup.password');
        let database = config.get('mysqlLocal.startup.database');
        let port = config.get('mysqlLocal.startup.port');

        // Load params if provided by calling routine
        if ( databaseObject != null) {
            if (databaseObject.host != null  &&  databaseObject.host != '') {
                host = databaseObject.host;
            };
            if (databaseObject.user != null  &&  databaseObject.user != '') {
                user = databaseObject.user;
            };
            if (databaseObject.password != null  &&  databaseObject.password != '') {
                password = databaseObject.password;
            };
            if (databaseObject.database != null  &&  databaseObject.database != '') {
                database = databaseObject.database;
            };
            if (databaseObject.port != null  &&  databaseObject.port != '') {
                port = databaseObject.port;
            };

            // Decompose the options
            // TODO - what structure should optons take - list, array, Object?
            if (databaseObject.options != null) {
                Object.keys(databaseObject.options).forEach(function(key) {
                    var val = databaseObject.options[key];
                    console.log('Options:', key, val);
                });
            };
        };

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

        // Connect to DB
        pool.getConnection((err, connection) => {
            console.log('  mySQL.datalayer getConnection Start')
            if (err) {
                console.log('  mySQL.datalayer Error in getConnection', err)
                reject(err);
            };
            console.log('  mySQL.datalayer After getConnection - if (err)')

            // Make the query
            connection.query(queryString, [sqlParameters], (err, results) => {
                console.log('  mySQL.datalayer After query')
                if (err) {
                    console.log('  mySQL.datalayer Error in query', err)
                    reject(err);
                };
                console.log('  mySQL.datalayer End query')
                resolve(results);
            });
        });
    });
}

exports.getData = function(datasource, queryObject) {
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

        // Set results = [] (data block to return to Workstation)
        results = [];

        debugDev('Properties read from DS id:', datasource.id, username, password, databaseName, port, serverType, serverName, dataTableName, dataSQLStatement, cacheResultsOnServer)

        // 2. Connect to the MySQL DB
        results = [];
        select(databaseObject, dataTableName, fields, dataSQLStatement, sqlParameters)
            .then(returnedData => {

                //  Now, results = [data], with Count
                results = JSON.parse(JSON.stringify(returnedData));
                let nrRecordsReturned = 0;
                if (results != null) {
                    nrRecordsReturned = results.length;
                };

                // TODO - later
                // 3. Do the Transformations according to the Tr loaded in step 1

                // 4. Store the data in Canvas ClientData
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
                                return {
                                    "statusCode": "error",
                                    "message" : "Error caching data from MySQL on Server",
                                    "data": null,
                                    "error":err.message
                                };
                            };
                        }
                    );
                };

                // 5. If (SORT_OBJECT) then results = results.sort()
                // Sort ASC on given field, -field means DESC
                // TODO
                //  - else, return sortOrder = 1 depending on - in field, see TypeScript
                if (sortObject != null  &&  results != null) {

                    // DESC, and take off -
                    if (sortObject[0] === "-") {
                        sortOrder = 1;
                        sortObject = sortObject.substr(1);
                        results.sort( (a,b) => {
                            if (a[sortObject] > b[sortObject]) {
                                return -1;
                            };
                            if (a[sortObject] < b[sortObject]) {
                                return 1;
                            };
                            return 0;
                        });
                    } else {
                        results.sort( (a,b) => {
                            if (a[sortObject] > b[sortObject]) {
                                return 1;
                            };
                            if (a[sortObject] < b[sortObject]) {
                                return -1;
                            };
                            return 0;
                        });
                    };
                };

                // 6. If (FIELDS_STRING) then results = results[fields]
                if (fieldsObject != null) {
                    Object.keys(filterObject).forEach( key => {
                        // Get the key-value pair
                        let value = filterObject[key];
                    });
                };

                // 7. If (FILTER_OBJECT) then results = results.filter()
                if (filterObject != null  &&  results != null) {
                    filterObject = JSON.parse(filterObject)
                    Object.keys(filterObject).forEach( key => {
                        // Get the key-value pair
                        let value = filterObject[key];

                        results = results.filter(r => {
                            return r[key] == value;
                        })
                    });
                };

                // 8. If (AGGREGATION_OBJECT) then results = results.clever-thing

                // 9. Add metadata, hopefully obtained directly from the source DB, or from the DS (if pre-stored),
                //     with prudent defaults where unknown.

                if (dataFields != null) {
                    if (dataFieldTypes == null) {
                        dataFieldTypes = [];
                    };
                    if (dataFieldLengths == null) {
                        dataFieldLengths = [];
                    };

                    var fields = [];

                    // Loop on metatdata
                    for (var i = 0; i < dataFields.length; i++) {
                        const fieldName = dataFields[i];

                        let fieldType = '';
                        if (i < dataFieldTypes.length) {
                            fieldType = dataFieldTypes[i];
                        };

                        let fieldLength = '';
                        if (i < dataFieldLengths.length) {
                            fieldLength = dataFieldLengths[i];
                        };

                        fields.push(
                            {
                                "fieldName": fieldName,
                                "fieldType": fieldType,
                                "length": fieldLength,
                                "average": null,
                                "max": null,
                                "median": null,
                                "min": null,
                                "sum": null
                            }
                        );
                    };
                };

                // 10. Return results with metadata according to the CanvasHttpResponse interface
                return {
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
                };
        })
        // If any error, return err according to the CanvasHttpResponse interface
        .catch(err =>{
            console.error('Err after datalayer.select called from clientData.router', err);
            return {
                "statusCode": "error",
                "message" : "Error: Err after datalayer.select called from clientData.router for id:", id,
                "data": null,
                "error": err
            };
        });

    });

}
