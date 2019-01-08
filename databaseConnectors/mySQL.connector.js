// Connector for MySQL database

var mysql = require('mysql');

var pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
    connectionLimit: 10,
    supportBigNumbers: true
});

const config = require('config');               // Configuration
let psw = config.get('password.janniei');
var pool  = mysql.createPool({
    connectionLimit : 10,
    host            : '127.0.0.1',
    user            : 'janniei',
    password        : psw,
    database        : 'mysql',
    connectionLimit: 10,
    supportBigNumbers: true
});

// Get records from a city
exports.getRecords = function(city, callback) {
    var sql = "SELECT * FROM user WHERE Host=?";
    // get a connection from the pool
    pool.getConnection(function(err, connection) {
        console.log('Start getConnection')
        if (err) { console.log(err); callback(true); return; }
        console.log('After getConnection - if (err)')
        // make the query
        connection.query(sql, [city], function(err, results) {
        console.log('After query')

        connection.release();
        console.log('After getConnection - release')

        if (err) { console.log(err); callback(true); return; }
        console.log('After release - if (err)')
        callback(false, results);
        console.log('@End not callable')
        });
    });
}; 