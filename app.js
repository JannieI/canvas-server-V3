// Basic Express imports -----------------------------------------------------------------
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
const express = require('express');
const favicon = require('serve-favicon')

// Third Party imports -------------------------------------------------------------------
const helmet = require('helmet');               // Security & Protection
const session = require('express-session');
const morgan = require('morgan');               // Used for logging

// const mongoose = require('mongoose');
const mongoDatabase = require('./databaseConnectors/mongoLocalDatabase');

const passport = require('passport');
// var GitHubStrategy = require('passport-github').Strategy;
// const passportConfig = require('./configPassport');

// Require Routers ---------------------------------------------------------------
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authGitHubRouter = require('./routes/authGitHubRouter');
const authGoogleRouter = require('./routes/authGoogleRouter');
const authLocalRouter = require('./routes/authLocalRouter');
const canvasDataRouter = require('./routes/canvasDataRouter');
const secureRouter = require('./routes/secure-route');
require('./auth/auth');


// Functions ---------------------------------------------------------------------
function validateUser(req, res, next) {
    // Get info out of req object
    // Check against DB
    // Store the answer in the res object
    res.locals.validatedUser = true;
    if (req.method == 'POST') {
        console.log('In validateUser ');
        console.log('');
    };
    next();
};

const UserModel = require('./model/models');
// mongoose.connect('mongodb://127.0.0.1:27017/Canvas');
// mongoose.connection.on('error', error => console.log('Mongoose Connection error: ',error) );
// mongoose.Promise = global.Promise;

// Start Express -------------------------------------------------------------
var app = express();


// Runs for ALL routes ----------------------------------------------------------
// Initial middleware on ALL routes and ALL methods
//  For ONE route: app.use('/admin', validateUser);
//  For ONE method, ALL routes: app.get(validateUser);

// Security
app.use(helmet());      // NB: Place this first thing

// Logging: use export NODE_ENV to set app.get('env') in Node Terminal !
if (app.get('env') == 'development') {
    app.use(morgan(':method :url :status :res[content-length] - :response-time ms ON [:date[iso]] FROM :remote-addr - :remote-user'));
}

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// Note: for now, we dont use bodyParser.urlencoded as we only send and receive json
//       If we POST web forms, this will convert the key-value pairs to json objects

// Cors 
app.use( (req, res, next) => {
    console.log('Inside CORS');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    console.log('')
    next();
});

// Logging details
app.use( (req, res, next) => {
    console.log('Logging details for mode: ', app.get('env'))
    console.log('    req.baseUrl', req.baseUrl);
    console.log('    req.cookies', req.cookies);
    console.log('    req.fresh', req.fresh);
    console.log('    req.hostname', req.hostname);
    console.log('    req.ip', req.ip);
    console.log('    req.ips', req.ips);
    console.log('    req.method', req.method);
    console.log('    req.originalUrl', req.originalUrl);
    console.log('    req.params', req.params);
    console.log('    req.path', req.path);
    console.log('    req.protocol', req.protocol);
    console.log('    req.query', req.query);
    console.log('    req.route', req.route);
    console.log('    req.secure', req.secure);
    console.log('    req.subdomains', req.subdomains);
    console.log('    req.xhr', req.xhr);
    console.log('    req.get(Content-Type)', req.get('Content-Type') );
    console.log('    req.is(html)', req.is('html') );
    console.log('    req.is(text/html)', req.is('text/html') );
    console.log('    req.is(application/json)', req.is('application/json') );
    console.log('')

    next();
});


// View engine setup
app.set('views', path.join(__dirname, 'views'));
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
app.get('/canvas', (req, res, next) => {
    res.sendFile(path.join(__dirname, '/public/dist/', 'index.html'))
});
app.use('/users', usersRouter);
app.use('/auth/github/', authGitHubRouter);
app.use('/auth/google/', authGoogleRouter);
app.use('/canvasdata', canvasDataRouter);
app.use('/', indexRouter);


// catch 404 and forward to error handler
app.use( (req, res, next) => {
    next(createError(404));
});

// Error handler
app.use( (err, req, res, next) => {

    // Log, set status and return Error
    console.log('Error: ', err)
    if (req.method == 'POST') {
        console.log('app.js error req.body: ', req.body)
    };
    res.status(err.status || 500);
    res.json({
        "statusCode": "error",
        "message" : "Error: " + err.status,
        "data": null,
        "error": err
    });

    console.log('');
});

// Export for bin/www
module.exports = app;
