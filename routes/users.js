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
    if (databaseConn != null) {
        db = databaseConn.db('Canvas');
    };
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
// Notes:
// Edit Aliases with sudo nano ~/.bashrc
//  msc = Mongo Server Client for user JannieI
//  mls = Mongo Logcal Server for --dbpath ~/Projects/canvas-mongoDB
//        default in config /etc/mongodb.conf
//  mlc = Mongo Local Client
// Bulk import in bulkImportInstructions.sh 
// /home/jannie/Projects/canvas-server/data/Import Data 2018-11-29

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
// To set Google:
// unCapcha: https://accounts.google.com/b/0/DisplayUnlockCaptcha
// Less secure: https://myaccount.google.com/lesssecureapps
router.get('/email', (req, res, next) => {

    const nodemailer = require('nodemailer');

    // Works pre OAuth
    // const transporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     auth: {
    //         user: 'jimmelman@gmail.com',
    //         pass: 'positif!01'
    //     }
    // });





    // OAuth Example
    // For Gmail Auth, see:
    // https://developers.google.com/identity/protocols/OAuth2
    // https://stackoverflow.com/questions/24098461/nodemailer-gmail-what-exactly-is-a-refresh-token-and-how-do-i-get-one
    // http://masashi-k.blogspot.com/2013/06/sending-mail-with-gmail-using-xoauth2.html
    // For second auth, see: https://stackoverflow.com/questions/10827920/not-receiving-google-oauth-refresh-token
    // See config file for details
    var auth = {
        type: 'oauth2',
        user: '',
        clientId: '',
        clientSecret: '',
        refreshToken: '',
    };

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: auth
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
            res.json({ msg: 'Error: ', error: error});
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
