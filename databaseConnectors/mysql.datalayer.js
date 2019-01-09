// Connector for MySQL database
// Note: at the moment this is not used - consider whether necessary at Architecture design

const mysql = require('mysql');
const config = require('config');               // Configuration

// createConnectionDefinition
exports.createConnectionDefinition = function(host, user, password, database, options) {
// Defines the pool object ~ connection string to connect to MySQL
    return new Promise((resolve, reject) => {

        // TODO - find a better way to do these !!!
        if (host == undefined) {
            host = '127.0.0.1';
        };
        if (user  == undefined) {
            user = 'janniei';
        };
        if (password == undefined) {
            password = config.get('password.janniei');
        };
        if (database == undefined) {
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

exports.select = function(pool, sql, user) {
// Selects the records from the MySQL database according to the given parameters.
    return new Promise((resolve, reject) => {

        pool.getConnection((err, connection) => {
            console.log('  mySQL.connector getConnection Start')
            if (err) { 
                console.log('  mySQL.connector Error in getConnection', err)
                reject(err);
            };
            console.log('  mySQL.connector After getConnection - if (err)')
            
            // Make the query
            // let user = 'janniei';
            connection.query(sql, [user], (err, results) => {
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