// Connector for MySQL database
// Note: at the moment this is not used - consider whether necessary at Architecture design

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