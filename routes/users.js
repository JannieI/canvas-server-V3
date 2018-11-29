var express = require('express');
var router = express.Router();
// Functions -----------------------------------------------------------

// Validate the user
function validateUser(req, res, next) {
  // Get info out of req object
  // Check against DB ...
  // Store the answer in the res object for further Middleware to use
  res.locals.validatedUser = true;
  next();
}


// Mongo
const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const mongoUrl = `mongodb://localhost:27017`;

let db;
mongoClient.connect(mongoUrl,(error, databaseConn)=>{
    db = databaseConn.db('test');
});


// Postgress
const dbPgWeather = require('../databaseConnectors/dbPgWeather');
// const PoolClass = require('pg').Pool;

// // const { Pool } = require('pg')
// // const pg = require('pg');
// // const pgPool = pg.Pool;
// const pool = new PoolClass({
//     user: 'postgres',
//     host: 'localhost',
//     database: 'weatherTiler_development',
//     port: 5432,
//     password: ''
// });

router.get('/pg',(req, res)=>{
    const query = 'SELECT * FROM city_weathers WHERE id > $1'
    const scaryDataFromInternet = 36;
    // pool.query(query,[scaryDataFromInternet],(error, dbResponse)=>{
    // pool.query('SELECT $1::text as message', ['Hello world!'],(error, dbResponse)=>{
    dbPgWeather.query(query,(error, dbResponse)=>{
      if (dbResponse != undefined) {  
          console.log(dbResponse.rows)
          res.json(dbResponse.rows)
      } else {
          console.log(dbResponse)
          res.json({msg: "Query ran, no data to return"})
      }
    })

    // Release module
    // pool.end();
})

router.get('/mongo',(req, res)=>{
    db.collection('contacts').find({}).toArray((queryError, carsResults)=>{
        console.log(carsResults)
        res.json(carsResults)
    })
})


// MySQL
const mysqlDb = require('../databaseConnectors/dbMySQLTodo');

/* GET home page. */
router.get('/mysql', function(req, res, next) {
    // res.render('index', { title: 'Express' });
    //   const queryText= 'SELECT * FROM tasks WHERE id > ? AND taskName';
    const queryText= 'SELECT 1 As taskName';
    mysqlDb.query(queryText,[3],(error,results)=>{
        console.log(results)
        res.json(results)
    })
});

// Runs for ALL routes -----------------------------------------------------------

// Validate the user
router.use(validateUser);


// Emailer
router.get('/email', function(req, res, next) {

    var nodemailer = require('nodemailer');

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'jimmelman@gmail.com',
        pass: ''
      }
    });

    var mailOptions = {
      from: 'jimmelman@gmail.com',
      to: 'jimmelman@gmail.com',
      subject: 'Sending Email using Node.js',
      text: 'That was easy!'
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        res.send('Error: ', error)
      } else {
        console.log('Email sent: ' + info.response);
        res.send('Email Send!')
      }
    });
})

// Methods for this Router -----------------------------------------------------------

// GET / page
router.get('/', function(req, res, next) {
    console.log('In Users Route')
    res.send('respond with a resource');
});

module.exports = router;
