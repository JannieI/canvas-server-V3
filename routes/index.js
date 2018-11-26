var express = require('express');
var router = express.Router();

// Functions
function validateUser(req, res, next) {
    // Get info out of req object
    // Check against DB
    // Store the answer in the res object
    res.locals.validatedUser = true;
    next();
}

// Get Data
const canvasBackgroundcolorsDefaults = require('../data/canvasBackgroundcolorsDefaults');

// Runs for ALL routes
router.use(validateUser);

/* POST home page. */
router.post('/', function(req, res, next) {
    console.log('I AM in Post ...')
    res.type('html');
    res.send(`<h1> POST Home Page </h1>`);
});

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});


// Get canvasBackgroundcolorsDefaults
router.get('/background', (req, res, next) => {
    // Get the page nr to start from the query string
    let pageStartNrRequested = req.query.page;
    let pageSize = 19;    // Is actually 20 since we base 0
    if (pageStartNrRequested == undefined) {
        pageStartNrRequested = 1;   // Make default 1 => rows start at 0
        pageSize = canvasBackgroundcolorsDefaults.length;
    };

    // Define starting position, and extract required data
    const rowStartNr = (pageStartNrRequested - 1) *20;
    const results = canvasBackgroundcolorsDefaults.slice(rowStartNr, rowStartNr + pageSize);

    // Return
    res.json(results);
});

module.exports = router;
