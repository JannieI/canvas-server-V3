// Require Native modules
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');

// Require Express
var express = require('express');

// Require Third party apps
var logger = require('morgan');
const helmet = require('helmet');

// Require Routers
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// Functions
function validateUser(req, res, next) {
    // Get info out of req object
    // Check against DB
    // Store the answer in the res object
    res.locals.validatedUser = true;
    next();
}

// Express & Helmet
var app = express();
app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Initial middleware on ALL routes and ALL methods
//  For ONE route: app.use('/admin', validateUser);
//  For ONE method, ALL routes: app.get(validateUser);
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

// Routing
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

// For bin/www.js
module.exports = app;
