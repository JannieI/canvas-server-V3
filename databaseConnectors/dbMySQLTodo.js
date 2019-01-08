var mysql = require('mysql');
const config = require('config');               // Configuration

let psw = config.get('password.janniei');
var pool  = mysql.createPool({
  connectionLimit : 10,
  host            : '127.0.0.1',
  user            : 'janniei',
  password        : psw,
  database        : 'mysql'
});

// const dataFromTheScaryInternet = 3

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
// - service mysqld status
// - service mysqld stop
// - service mysqld start
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

module.exports = {
    
    query: (queryText,params,callback)=>{
        return pool.query(queryText, params, callback);
    }
};
// pool.query('SELECT * FROM tasks WHERE id > ?', [dataFromTheScaryInternet], function (error, results, fields) {
//   if (error) throw error;
//   console.log(results[0]);
// });