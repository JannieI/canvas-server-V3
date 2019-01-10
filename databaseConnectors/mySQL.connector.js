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

