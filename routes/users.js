// Basic imports -----------------------------------------------------------------
var express = require('express');
var router = express.Router();

// Functions ---------------------------------------------------------------------

// Validate the user
function validateUser(req, res, next) {
  // Get info out of req object
  // Check against DB ...
  // Store the answer in the res object for further Middleware to use
  res.locals.validatedUser = true;
  next();
};

// Runs for ALL routes -----------------------------------------------------------

// Get Parameters
router.param(('collection'), (reg, res, next) => {
    // Update analytics in db as someone hit this ID
    next();
});


// Mongo
const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const mongoUrl = `mongodb://127.0.0.1:27017`;

let db;
mongoClient.connect(mongoUrl,(error, databaseConn)=>{
    db = databaseConn.db('Canvas');
});


// Postgress
const dbPgWeather = require('../databaseConnectors/dbPgWeather');

router.get('/pg',(req, res)=>{
    const query = 'SELECT * FROM city_weathers WHERE id > $1'
    const scaryDataFromInternet = 36;

    dbPgWeather.query(query,(error, dbResponse)=>{
        if (dbResponse != undefined) {  
            console.log(dbResponse.rows);
            res.json(dbResponse.rows);
        } else {
            console.log(dbResponse)
            res.json({msg: "Query ran, no data to return"})
        };
    })
})

// Mongo
router.get('/mongo:collection',(req, res)=>{
    let collection = req.params.collection.substring(1);
    console.log(req.params, collection.substring(1))
    db.collection(collection).find({}).toArray((queryError, carsResults)=>{
        console.log(carsResults);
        res.json(carsResults);
    });
})

router.get('/mongo',(req, res)=>{
    let collection = 'contacts';
    db.collection(collection).find({}).toArray((queryError, carsResults)=>{
        console.log(carsResults);
        res.json(carsResults);
    });
})


// MySQL
const mysqlDb = require('../databaseConnectors/dbMySQLTodo');

/* GET home page. */
router.get('/mysql', (req, res, next) => {
    // res.render('index', { title: 'Express' });
    //   const queryText= 'SELECT * FROM tasks WHERE id > ? AND taskName';
    const queryText= 'SELECT 1 As taskName';
    mysqlDb.query(queryText,[3],(error,results)=>{
        console.log(results);
        res.json(results);
    });
});

// Runs for ALL routes -----------------------------------------------------------

// Validate the user
router.use(validateUser);


// Emailer
router.get('/email', (req, res, next) => {

    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'jimmelman@gmail.com',
            pass: ''
        }
    });

    const mailOptions = {
      from: 'jimmelman@gmail.com',
      to: 'jimmelman@gmail.com',
      subject: 'Sending Email using Node.js',
      text: 'That was easy!'
      // html: '<p>Your html here</p>'// plain text body
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.json({ msg: 'Error: '});
        } else {
            console.log('Email sent: ' + info.response);
            res.json({ msg: 'Email Send!'});
        };
    });
})

// Methods for this Router -----------------------------------------------------------

// GET / page
router.get('/', (req, res, next) => {
    console.log('In Users Route');
    res.send('respond with a resource');
});

module.exports = router;
