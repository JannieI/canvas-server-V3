// All Canvas (application-specific) data routes
const express = require('express');
const passport = require('passport');
const router = express.Router();

const UserModel = require('../model/models');

// Verify User as valid (exists in Canvas DB)
router.get('/', (req, res, next) => {
    console.log('Router: GET ', req.body)
    console.log('')

    res.send( 
        {
            message: "It works!"
        }
    );
});
