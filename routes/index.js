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

function requireJSON(req, res, next) {
    // NB req.is returns false if there is no body !
    if (!req.is('application/json')) {
        res.json({msg: "Content type my be JSON"})
    } else {
        next();
    };
}
// Get Data
const canvasBackgroundcolorsDefaults = require('../data/canvasBackgroundcolorsDefaults');

// Runs for ALL routes
router.use(validateUser);

router.param(('id'), (reg, res, next) => {
    // Update analytics in db as someone hit this ID
    next();
})

// Used for ALL routes in this module
router.use((req, res, next) => {
    const searchTerm = req.query.query;
    if (!searchTerm) {
        res.json( {msg: "Search term required"} )
    } else {
        next();
    };
});

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


// Get ALL / SELECTED canvasBackgroundcolorsDefaults
router.get('/background', (req, res, next) => {
    // Get the page nr to start from the query string
    let pageStartNrRequested = req.query.page;
    let pageSize = 19;    // Is actually 20 since we base 0
    if (pageStartNrRequested == undefined) {
        pageStartNrRequested = 1;   // Make default 1 => rows start at 0
        pageSize = canvasBackgroundcolorsDefaults.length - 1;
    };

    // Define starting position, and extract required data
    const rowStartNr = (pageStartNrRequested - 1) *20;
    const results = canvasBackgroundcolorsDefaults.slice(rowStartNr, rowStartNr + pageSize);

    // Say if no records
    if (!results) {
        res.json({
            rows: 0,
            msg: "No records found"
        });
    } else {
        // Return Data
        res.json( 
            { 
                page: pageStartNrRequested,
                rows: pageSize,
                results: results
            }
        );
    };
});

// Get SINGLE canvasBackgroundcolorsDefaults
// This has to come LAST in .../something
router.get('/background:id', (req, res, next) => {
    // Get the page nr to start from the query string

    const id = req.params.id;
    // Define starting position, and extract required data
    const results = canvasBackgroundcolorsDefaults.filter(row => {
        row.id == Number(id);
    });

    // Say if no records
    if (!results) {
        res.json({
            rows: 0,
            msg: "Record id " + id + " does not exist."
        });
    } else {
        // Return Record
        res.json( 
            { 
                id: id,
                rows: 1,
                results: results
            }
        );
        };
});

// ADD a record
router.post(':id', requireJSON, (req, res, next) => {
    const id = req.params.id;
    const rate = req.body.value;
    if (rate < 10) {
        res.json( {msg: "Rating must be greater 10"} );
    } else {
        res.status(300);
        res.json( 
            { 
                statusCode: 200,
                msg: "Rating updated"
            } 
        );
    };
});

router.delete(':id', (req, res, next) => {
    res.json( 
        { 
            statusCode: 200,
            msg: "Rating Deleted !"
        } 
    );

});

module.exports = router;
