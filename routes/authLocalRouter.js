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
    console.log('Router: POST signup', req.body.companyName, req.body.userID, req.body.password)
    console.log('')

    try {
        console.log('    try block starts')
        console.log('');

        // Determine if user already exists in the database
        UserModel.find( { companyName: req.body.companyName, userID: req.body.userID }, 
            (err, user) => {
            if (err) {

                // Create a new user record since it does not exist
                var newUser = UserModel({
                    companyName: req.body.companyName,
                    userID: username,
                    email: 'Unknown',
                    password: req.body.password,
                    createdBy: '',
                    createdOn: null,
                    updatedBy: '',
                    updatedOn: null

                });

                // Save the record
                newUser.save((err) => {
                    if (err) {
                        console.log('    signup failed: ', err);
                        return err;
                    };

                    console.log('    User created!');
                }); 

                //Send the user information to the next middleware
                console.log('    auth.signup: Success for ', newUser);
                res.json({ 
                    "message" : "Signup successful !",
                    "user": newUser
                });

            } else {;            
                // User found
                console.log('    auth.signup: User Already exists ', user);
                res.json({ 
                    "message" : "User already exists for this Company"
                });
            };
        });

        // //Send the user information to the next middleware
        // console.log('    auth.signup: Success for ', newUser);
        // return done(null, newUser);;
    } catch (error) {
        console.log('    Error: ', error)
        res.json({ 
            "message" : "Error: " ,
            error: error
        });
};


    res.json({ 
        "message" : "Signup successful !",
        "companyName": req.body.companyName,
        "userID": req.body.userID
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