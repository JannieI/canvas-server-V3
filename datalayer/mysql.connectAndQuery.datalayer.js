// Connect to MySQL database and perform a given query

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

module.exports = function connectAndQuery(databaseObject, table, fields, queryString, sqlParameters) {
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
