// Authenticate (signup, login) routes
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const router = express.Router();

//When the user sends a post request to this route, passport authenticates the user based on the
//middleware created previously
// curl -v -X POST http://localhost:8000/signup -H "application/json" -d 'password=jannie' -d 'email=jannie@gmail.com'
router.post('/signup', passport.authenticate('signup', { session : false }) , async (req, res, next) => {
    console.log('authenticate signup', req)
    res.json({ 
    message : 'Signup successful',
    user : req.user 
  });
});

// curl -v -X POST http://localhost:8000/login -H "application/json" -d 'password=jannie' -d 'email=jannie@gmail.com'
router.post('/login', (req, res, next) => {
    console.log('/login (authenticate)');
    passport.authenticate('login', (err, user, info) => {     
        try 
            {

                if(err || !user){
                const error = new Error('An Error occured')
                return next(error);
                }
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
        }
    })(req, res, next);
  });
  
  
  module.exports = router;