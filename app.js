// Basic imports -----------------------------------------------------------------
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
const express = require('express');
const favicon = require('serve-favicon')

// Third Party modules -----------------------------------------------------------
const helmet = require('helmet');
const session = require('express-session');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
// var GitHubStrategy = require('passport-github').Strategy;
// const passportConfig = require('./configPassport');
const morgan = require('morgan');

// Require Routers ---------------------------------------------------------------
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
var authGitHubRouter = require('./routes/authGitHubRouter');
var authGoogleRouter = require('./routes/authGoogleRouter');
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
mongoose.connect('mongodb://127.0.0.1:27017/Canvas');
mongoose.connection.on('error', error => console.log('Mongoose Connection error: ',error) );
mongoose.Promise = global.Promise;

// Express & Helmet -------------------------------------------------------------
var app = express();
app.use(helmet());
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(morgan('tiny'));

// Parse form data to create req.body
// app.use( bodyParser.urlencoded({ extended : false }) );


// Runs for ALL routes ----------------------------------------------------------
// Initial middleware on ALL routes and ALL methods
//  For ONE route: app.use('/admin', validateUser);
//  For ONE method, ALL routes: app.get(validateUser);

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
    console.log('Logging details')
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

app.use(morgan('dev'));
app.use(cookieParser());
app.use(validateUser);

// JSON & URLencoded to create req.body (in right format)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Statics: Can access all info in this folder:
// 1. Dont need to include public in the path
// 2. Dont need a path for it.
// 3. Can have more than one, just add another app.use
// 4. Public obviously cannot contain sensitive info
// 5. Place under app line
app.use(express.static(path.join(__dirname, '/public/dist/')));

// Example for Query parameters
// app.use( (req, res, next) => {
//   user = req.query.name?  req.query.name  :  ''; 
//   message = req.query.msg?  req.query.msg  :  '';
//   console.log(user)
//   console.log(message)
//   next();
// });
 
// Example for Parameters - looks if any route any method has a :id parameter
// app.param('id', (req, res, next, id) => {
//   // Store, validate this
//   next();
// });

// Example with NO Router
// app.get('/', (req, res, next) => {
//   console.log(req.query, res.locals.validatedUser)
//   res.send('Canvas-Server running on port ' + port + 
//       ', validated: ' + ' ' + 
//       (res.locals.validatedUser!=undefined?  res.locals.validatedUser  :  '') 
//       + ' ' + user + ' ' + message);

//   // res.sendFile(path.join(__dirname + '/public/Photo1.JPG'));
//   // res.json({ "name": "Jannie"})
// });

// Routing ------------------------------------------------------------------------

app.use('/auth/local/profile', passport.authenticate('jwt', { session : false }), authLocalRouter );
// app.use('/auth/local/profile', passport.authenticate('jwt', { session : false }), secureRouter );
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
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    console.log('Error: ', err)
    if (req.method == 'POST') {
        console.log('app.js error req.body: ', req.body)
    };
    res.status(err.status || 500);
    res.json({msg: 'error', err});
    console.log('')
});

// Export for bin/www.js
module.exports = app;
