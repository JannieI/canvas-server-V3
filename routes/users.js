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

const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const mongoUrl = `mongodb://localhost:27017`;

let db;
mongoClient.connect(mongoUrl,(error, databaseConn)=>{
    db = databaseConn.db('test');
});

router.get('/mongo',(req, res)=>{
    db.collection('contacts').find({}).toArray((queryError, carsResults)=>{
        console.log(carsResults)
        res.json(carsResults)
    })
})

// Runs for ALL routes -----------------------------------------------------------

// Validate the user
router.use(validateUser);


// Methods for this Router -----------------------------------------------------------

// GET / page
router.get('/', function(req, res, next) {
  console.log('In Users Route')
  res.send('respond with a resource');
});

module.exports = router;
