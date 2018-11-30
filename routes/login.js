// Import Express and related modules -----------------------------------------------------------
var express = require('express');
var router = express.Router();

// Login to local Node Server
router.post('/loginLocalXXX',(req, res, next)=>{
    // req.body is made by urlencoded, which parses the http message for sent data!
    console.log('body', body)
    const password = req.body.password;
    const username = req.body.username;
    // check the db to see if user credentials are valid
    // if they are valid...
        // - save their username in a cookie    
        // - is send them to the welcome page
    if(password === "x"){
        // res.cookie takes 2 args:
        // 1. name of the cookie
        // 2. value to set it to 
        res.cookie('username',username);
        // res.redirect takes 1 arg:
        // 1. Where to send the brower
        res.redirect('/welcome');
    }else{
        // The "?" is a special character in a URL
        res.redirect('/login?msg=fail&test=hello')
    }
    // res.json(req.body)
})

// Logout
router.get('/logoutXXX',(req, res, next)=>{
    // res.clearCookie takes 1 arg: 
    // 1. Cookie to clear (by name)
    res.clearCookie('username');
    res.redirect('/login')
})