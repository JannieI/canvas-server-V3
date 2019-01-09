// Connector for MySQL database
// Note: at the moment this is not used - consider whether necessary at Architecture design

const mysql = require('mysql');
const config = require('config');               // Configuration

// createConnectionDefinition
exports.createConnectionDefinition = function(host, user, password, database, options) {
// Defines the pool object ~ connection string to connect to MySQL
    return new Promise((resolve, reject) => {

        // TODO - find a better way to do these !!!
        if (host == undefined  ||  host == null) {
            host = '127.0.0.1';
        };
        if (user  == undefined  ||  user  == null) {
            user = 'janniei';
        };
        if (password == undefined  ||  password == null) {
            password = config.get('password.janniei');
        };
        if (database == undefined  ||  database == null) {
            database = 'mysql';
        };

        // Decompose the options
        if (options != null) {
            Object.keys(options).forEach(function(key) {
                var val = options[key];
                console.log('va', val);
            });
        };

        const pool = mysql.createPool({
            connectionLimit  : 10,
            host             : '127.0.0.1',
            user             : 'janniei',
            password         : password,
            database         : 'mysql',
            connectionLimit  : 10,
            supportBigNumbers: true
        });

        // Return
        resolve(pool);
    });
}

// exports.select = function(host, user, password, database, options, sql, sqlParams) {
exports.select = function(databaseObject, table, fields, queryString, sqlParameters) {
// Selects the records from the MySQL database according to the given parameters.
    return new Promise((resolve, reject) => {

        let host = '127.0.0.1';
        let user = 'janniei';
        let password = config.get('password.janniei');
        let database = 'mysql';

        // TODO - find a better way to do these !!!
        if ( databaseObject != null) {
            if (databaseObject.host != null) {
                host = databaseObject.host;
            };
            if (databaseObject.user != null) {
                user = databaseObject.user;
            };
            if (databaseObject.password != null) {
                password = databaseObject.password;
            };
            if (databaseObject.database != null) {
                database = databaseObject.database;
            };
        };

        // Decompose the options
        if (sqlParameters != null) {
            Object.keys(sqlParameters).forEach(function(key) {
                var val = sqlParameters[key];
                console.log('va', val);
            });
        };

        const pool = mysql.createPool({
            connectionLimit  : 10,
            host             : host,
            user             : user,
            password         : password,
            database         : database,
            connectionLimit  : 10,
            supportBigNumbers: true
        });

        pool.getConnection((err, connection) => {
            console.log('  mySQL.connector getConnection Start')
            if (err) {
                console.log('  mySQL.connector Error in getConnection', err)
                reject(err);
            };
            console.log('  mySQL.connector After getConnection - if (err)')

            // Make the query
            // let sqlParams = 'janniei';
            connection.query(queryString, [sqlParameters], (err, results) => {
                console.log('  mySQL.connector After query')
                if (err) {
                    console.log('  mySQL.connector Error in query', err)
                    reject(err);
                };
                console.log('  mySQL.connector End query')
                resolve(results);
            });
        });
    });
}

exports.getRecords = function(sql, user, callback) {

    pool.getConnection((err, connection) => {
        console.log('  mySQL.connector getConnection Start')
        if (err) {
            console.log('  mySQL.connector Error in getConnection', err)
            callback(true); return;
        };
        console.log('  mySQL.connector After getConnection - if (err)')

        // Make the query
        // let user = 'janniei';
        connection.query(sql, [user], (err, results) => {
            console.log('  mySQL.connector After query')
            if (err) {
                console.log('  mySQL.connector Error in query', err)
                callback(true); return;
            };
            console.log('  mySQL.connector End query')
            callback(false, results);
        });
    });

}