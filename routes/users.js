// This is a testing module:  All the Mongo functions uses MongoClient should rather be handled by 
// Mongoose in canvasDataRouter 

// Imports -----------------------------------------------------------------
var express = require('express');
var router = express.Router();
const debugDev = require('debug')('app:dev');
const debugDB = require('debug')('app:db');


// Notes:
// Edit Aliases with sudo nano ~/.bashrc
//  msc = Mongo Server Client for user JannieI
//        mongo mongodb+srv://cluster0-wnczk.azure.mongodb.net/text --username JannieI --password JannieI
//  mls = Mongo Logcal Server for --dbpath ~/Projects/canvas-mongoDB
//        default in config /etc/mongodb.conf
//  mlc = Mongo Local Client
// Bulk import in bulkImportInstructions.sh 
// /home/jannie/Projects/canvas-server/data/Import Data 2018-11-29


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




// Postgress
const dbPgWeather = require('../databaseConnectors/dbPgWeather');

router.get('/pg',(req, res)=>{
    const query = 'SELECT * FROM city_weathers WHERE id > $1'
    const scaryDataFromInternet = 36;

    dbPgWeather.query(query,(error, dbResponse)=>{
        if (dbResponse != undefined) {  
            debugDB(dbResponse.rows);
            return res.json(dbResponse.rows);
        } else {
            debugDB(dbResponse)
            return res.json({msg: "Query ran, no data to return"})
        };
    })
})


// Mongo - uses MongoClient (not Mongoose)

// This is a local Mongo connection, just for testing
// TODO - remove, and use central one
const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const mongoUrl = `mongodb://127.0.0.1:27017`;
// const mongoUrl = `mongodb+srv://cluster0-wnczk.azure.mongodb.net/Canvas --username JannieI --password JannieI`

let db;
// Note from Mongoose docs/deprecations.html: The MongoDB Node.js driver rewrote the tool it uses to 
// parse MongoDB connection strings. Because this is such a big change, they put the new connection 
// string parser behind a flag. To turn on this option, pass the useNewUrlParser option to 
// mongoose.connect() or mongoose.createConnection().
mongoClient.connect(mongoUrl, { useNewUrlParser: true, useCreateIndex: true }, (error, databaseConn)=>{

    if (error != null) {
        debugDB('Error connecting to Mongo: ', error);
    };

    // debugDB('mongo connected to url: ', databaseConn.s.url)
    if (databaseConn != null) {
        db = databaseConn.db('Canvas');
        debugDB('Mongo connected to server/database: ', mongoUrl, '/', db.s.databaseName)
    } else {
        debugDB('Mongo connection object empty');
    };
    // debugDB('')
    // debugDB('----------------------------------------------------------------')
    // debugDB('')
});


router.get('/mongo:collection',(req, res)=>{
    let collection = req.params.collection.substring(1);
    debugDB('Mongo connected to server/database: ', mongoUrl, '/', db.s.databaseName)
 
    db.collection(collection).find({}).toArray((queryError, queryResult)=>{
        debugDB('Mongo results from server (length): ', queryResult.length);
        res.json(queryResult);
    });
})

router.get('/mongo',(req, res)=>{
    let collection = 'contacts';
    db.collection(collection).find({}).toArray((queryError, carsResults)=>{
        debugDB(carsResults);
        debugDB('')
        debugDB('----------------------------------------------------------------')
        debugDB('')
            res.json(carsResults);
    });
})









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
            debugDB(error);
            return res.json({ msg: 'Error: ', error: error});
        } else {
            debugDB('Email sent: ' + info.response);
            return res.json({ msg: 'Email Send!'});
        };
    });
})

// Methods for this Router -----------------------------------------------------------

// GET / page
router.get('/', (req, res, next) => {
    debugDB('In Users Route');
    res.send('respond with a resource');
});

module.exports = router;
