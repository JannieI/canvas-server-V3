// Authenticate (signup, login) routes
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

const UserModel = require('../model/models');

// Verify User as valid (exists in Canvas DB)
router.post('/verify', (req, res, next) => {
    console.log('Router: POST /verify', req.body)
    console.log('')

    if (req.body.userID == 'JannieI') {
        res.send(true);
    } else {
        res.send(false);
    }
});

//When the user sends a post request to this route, passport authenticates the user based on the
//middleware created previously
// curl -v -X POST http://localhost:8000/signup -H "application/json" -d 'password=jannie' -d 'email=jannie@gmail.com'
// router.post('/signup', passport.authenticate('signup', { session : false }) , async (req, res, next) => {
router.post('/signup', (req, res, next) => {
    console.log('authLocalRouter: POST signup', req.body.companyName, req.body.userID, req.body.password)
    console.log('')

    // try {
        // console.log('    try block starts')
        // console.log('');

        // Determine if user already exists in the database
        // UserModel.find( { companyName: req.body.companyName, userID: req.body.userID } )
        UserModel.find( { "userID": req.body.userID } )

        //   .then(doc => {
        //     console.log('Found: ', doc, req.body.companyName, req.body.userID)
        //   })
        //   .catch(err => {
        //     console.error('Error: ', err)
        //   })
        UserModel.find( { companyName: req.body.companyName, userID: req.body.userID },
            (err, user) => {

            if (err) {
                // Mongo Error
                console.log('    Error in Find ', err);
                res.json({
                    "statusCode": "error",
                    "message" : "Error in DB Find: " + err.message,
                    "data": null,
                    "error": err
                });
            };

            if (user.length == 0) {
                // Create a new user record since it does not exist
                var newUser = UserModel({
                    companyName: req.body.companyName,
                    userID: req.body.userID,
                    email: 'Unknown',
                    password: req.body.password,
                    createdBy: '',
                    createdOn: null,
                    updatedBy: '',
                    updatedOn: null
                });

                // Save the record
                newUser.save()
                    .then(user => {

                        //Success
                        console.log('    Success for ', user);
                        res.json({
                            "statusCode": "success",
                            "message" : "Signup successful !",
                            "data": user,
                            "error": null
                        });
                    })
                    .catch(err => {
                        // Save Failed
                        console.log('    Save user failed: ', err);
                        res.json({
                            "statusCode": "failed",
                            "message" : "Registration failed, cannot save user !",
                            "data": null,
                            "error": err
                        });
                    });
            } else {
                // User already exists
                console.log('    User Already exists ', user);
                res.json({
                    "statusCode": "failed",
                    "message" : "User already exists for this Company",
                    "data": user,
                    "error": null
                });
            };
    });

});

// curl -v -X POST http://localhost:8000/login -H "application/json" -d 'password=jannie' -d 'email=jannie@gmail.com'
router.post('/login', (req, res, next) => {
    console.log('/login (authenticate)');
    console.log('')

    // Do the login via Passport
    passport.authenticate('login', (err, user, info) => {
        try
            {

                if(err || !user){
                    const error = new Error('An Error occured')
                    return next(error);
                };
                req.login(user, { session : false }, async (error) => {
                    if( error ) return next(error)

                    //We don't want to store the sensitive information such as the
                    //user password in the token so we pick only the email and id
                    const body = { _id : user._id, email : user.email };
                    //Sign the JWT token and populate the payload with the user email and id
                    const token = jwt.sign({ user : body },'top_secret');
                    //Send back the token to the user
                    return res.json({ token });
                });
            }
        catch (error) {
            return next(error);
        };
    })(req, res, next);
  });


  module.exports = router;