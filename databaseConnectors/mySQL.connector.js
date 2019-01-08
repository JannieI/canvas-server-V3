// Connector for MySQL database

const mysql = require('mysql');
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

// Get records from a user
// exports.getRecords = function(city, callback) {
//     var sql = "SELECT * FROM user WHERE Host=?";
//     // get a connection from the pool
//     pool.getConnection(function(err, connection) {
//         console.log('Start getConnection')
//         if (err) { console.log(err); callback(true); return; }
//         console.log('After getConnection - if (err)')
//         // make the query
//         connection.query(sql, [city], function(err, results) {
//         console.log('After query')

//         connection.release();
//         console.log('After getConnection - release')

//         if (err) { console.log(err); callback(true); return; }
//         console.log('After release - if (err)')
//         callback(false, results);
//         console.log('@End not callable')
//         });
//     });
// }; 

exports.getRecords = function(city, callback) {

    pool.getConnection((err, connection) => {
        console.log('  mySQL.connector getConnection Start')
        if (err) { 
            console.log('  mySQL.connector Error in getConnection', err)
            callback(true); return;
        };
        console.log('  mySQL.connector After getConnection - if (err)')
        
        // Make the query
        let user = 'janniei';
        connection.query('SELECT User, Host, authentication_string FROM user WHERE User=?', [user], (err, results) => {
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