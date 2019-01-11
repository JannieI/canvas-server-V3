// Main middleware that handles all routes

// Basic Express imports -----------------------------------------------------------------
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
const express = require('express');
const favicon = require('serve-favicon')
const fs = require('fs')

// Third Party imports -------------------------------------------------------------------
const helmet = require('helmet');               // Security & Protection
const session = require('express-session');
const morgan = require('morgan');               // Used for logging
const config = require('config');               // Configuration
const debugDev = require('debug')('app:dev');
const debugDB = require('debug')('app:db');

// const mongoose = require('mongoose');
const mongoDatabase = require('./databaseConnectors/mongoLocalDatabase');
// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

const passport = require('passport');
// var GitHubStrategy = require('passport-github').Strategy;
// const passportConfig = require('./configPassport');

// Require Routers ---------------------------------------------------------------
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authGitHubRouter = require('./routes/authGitHub.router');
const authGoogleRouter = require('./routes/authGoogle.router');
const authLocalRouter = require('./routes/authLocal.router');
const canvasDataRouter = require('./routes/canvasData.router');
const clientDataRouter = require('./routes/clientData.router');
const secureRouter = require('./routes/secure-route');
require('./auth/auth');


// Functions ---------------------------------------------------------------------
function validateUser(req, res, next) {
    // Get info out of req object
    // Check against DB
    // Store the answer in the res object
    res.locals.validatedUser = true;
    if (req.method == 'POST') {
        debugDev('In validateUser ');
    };
    next();
};

// mongoose.connect('mongodb://127.0.0.1:27017/Canvas');
// mongoose.connection.on('error', error => debugDB.log('Mongoose Connection error: ',error) );
// mongoose.Promise = global.Promise;

// Start Express -------------------------------------------------------------
var app = express();


// Runs for ALL routes ----------------------------------------------------------
// Initial middleware on ALL routes and ALL methods
//  For ONE route: app.use('/admin', validateUser);
//  For ONE method, ALL routes: app.get(validateUser);

// Security
app.use(helmet());      // NB: Place this first thing

// setup the logger
app.use(morgan('combined', { stream: accessLogStream }));

// Logging: use export NODE_ENV to set app.get('env') in Node Terminal !
if (app.get('env') == 'development') {
    if (config.get('morgan.logging') == "on") {
        app.use(morgan('## :method :url :status :res[content-length] - :response-time ms ON [:date[iso]] FROM :remote-addr - :remote-user'));
        app.use(morgan('##'));
    };

    // Single resource logging
    // TODO - make this dynamic
    if (config.get('validRoutes').indexOf(config.get('morgan.resource')) >= 0) {
        app.use(morgan('## :method :url :status :res[content-length] - :response-time ms ON [:date[iso]] FROM :remote-addr - :remote-user'));
    };
};


// Show the url & path - just for info
app.use( (req, res, next) => {
    const url = require('url');

    console.log('  Url:',url.format(
        {
            protocol: req.protocol,
            host: req.get('host'),
            pathname: req.originalUrl
        })
    )
    console.log('  Path:', req.path)
    next();
});

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// Note: for now, we dont use bodyParser.urlencoded as we only send and receive json
//       If we POST web forms, this will convert the key-value pairs to json objects

// Cors 
app.use( (req, res, next) => {
    // debugDev('Inside CORS');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    next();
});

// Logging details - Leave here for testing
// app.use( (req, res, next) => {
//     debugDev('Logging details for mode: ', app.get('env'))
//     debugDev('    req.baseUrl', req.baseUrl);
//     debugDev('    req.cookies', req.cookies);
//     debugDev('    req.fresh', req.fresh);
//     debugDev('    req.hostname', req.hostname);
//     debugDev('    req.ip', req.ip);
//     debugDev('    req.ips', req.ips);
//     debugDev('    req.method', req.method);
//     debugDev('    req.originalUrl', req.originalUrl);
//     debugDev('    req.params', req.params);
//     debugDev('    req.path', req.path);
//     debugDev('    req.protocol', req.protocol);
//     debugDev('    req.query', req.query);
//     debugDev('    req.route', req.route);
//     debugDev('    req.secure', req.secure);
//     debugDev('    req.subdomains', req.subdomains);
//     debugDev('    req.xhr', req.xhr);
//     debugDev('    req.get(Content-Type)', req.get('Content-Type') );
//     debugDev('    req.is(html)', req.is('html') );
//     debugDev('    req.is(text/html)', req.is('text/html') );
//     debugDev('    req.is(application/json)', req.is('application/json') );

//     next();
// });

// Configuration: change NODE_ENV to development/production to use the data in the configuration
// files stored in config/development.json and config/production.json  default.json is over-written
// with the latter.
// NB - NEVER store sensitive info in these files as they are part of source control
//      Create Environment variables, and map them using the custom-environment-variables.json
//      file in the config folder.  For example, export MONGO_PASSWORD=abc in the terminal before
//      starting Node.  Then use config.has('mongo.password') to test if it exists, and 
//      config.get('mongo.password') to retrieve it (as per mapping in custom-environment-variables.json)

// Leave for testing
debugDev('Example of reading the Config, app:', config.get('appName'), 
    '"mongoServer address:"', config.get('mongo.serverAddress'), '"mongoPassword"', 
    config.get('mongo.password'));

// View engine setup - only used to render a web page, maybe for fancy 404 ....
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade');

app.use(cookieParser());
app.use(validateUser);

// JSON & URLencoded to create req.body (in right format)
app.use(express.json());   // Create req.body
app.use(express.urlencoded({ extended: true }));  // Take key-value from form into req.body.  Extended = arrays too

// Statics: Can access all info in this folder(s) below (ie is Public):
app.use(express.static(path.join(__dirname, '/public/dist/')));


// Routing ------------------------------------------------------------------------
app.use('/auth/local/profile', passport.authenticate('jwt', { session : false }), authLocalRouter );
app.use('/auth/local', authLocalRouter);
// Show Canvas Workstation page
app.get('/canvas', (req, res, next) => {
    // res.sendFile(path.join(__dirname, '/public/dist/', 'index.html'))
});
app.use('/users', usersRouter);
app.use('/auth/github/', authGitHubRouter);
app.use('/auth/google/', authGoogleRouter);
// ALL Canvas data-related API calls
app.use('/canvasdata', canvasDataRouter);
app.use('/clientdata', clientDataRouter);
app.use('/', indexRouter);


// Dev error handler
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            "statusCode": "error",
            "message" : "Error: " + err.status,
            "data": null,
            "error": 
                {
                    "errorObject": err
                }
        });
    });
};
  
// Production error handler: no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        "statusCode": "error",
        "message" : "Error: " + err.status,
        "data": null,
        "error": 
            {
                "errorObject": err
            }
    });
});

// Export for bin/www
module.exports = app;
