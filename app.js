// Basic imports -----------------------------------------------------------------
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
const express = require('express');

// Third Party modules -----------------------------------------------------------
const helmet = require('helmet');
var logger = require('morgan');
const session = require('express-session');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
// var GitHubStrategy = require('passport-github').Strategy;
// const passportConfig = require('./configPassport');


// Require Routers ---------------------------------------------------------------
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authGitHubRouter = require('./routes/authGitHubRouter');
var authGoogleRouter = require('./routes/authGoogleRouter');
const authenticateRouter = require('./routes/authenticate');
const secureRouter = require('./routes/secure-route');
require('./auth/auth');


// Functions ---------------------------------------------------------------------
function validateUser(req, res, next) {
    // Get info out of req object
    // Check against DB
    // Store the answer in the res object
    res.locals.validatedUser = true;
    next();
}

const UserModel = require('./model/models');
mongoose.connect('mongodb://127.0.0.1:27017/passport-jwt', { useMongoClient : true });
mongoose.connection.on('error', error => console.log('Mongoose Connection error: ',error) );
mongoose.Promise = global.Promise;

// Express & Helmet -------------------------------------------------------------
var app = express();
app.use(helmet());

// Parse form data to create req.body
// app.use( bodyParser.urlencoded({ extended : false }) );


// Runs for ALL routes ----------------------------------------------------------
// Initial middleware on ALL routes and ALL methods
//  For ONE route: app.use('/admin', validateUser);
//  For ONE method, ALL routes: app.get(validateUser);

// Cors 
app.use( (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
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
app.use(express.static(path.join(__dirname, 'public')));

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
app.use('/signup', authenticateRouter);
app.use('/login', authenticateRouter);
app.use('/profile', passport.authenticate('jwt', { session : false }), secureRouter );

app.use('/users', usersRouter);
app.use('/auth/github/', authGitHubRouter);
app.use('/auth/google/', authGoogleRouter);
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
    console.log('app.js error req.body: ', req.body)

    res.status(err.status || 500);
    res.json({msg: 'error', err});
});

// Export for bin/www.js
module.exports = app;
