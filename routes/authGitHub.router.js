// Basic imports -----------------------------------------------------------------
var express = require('express');
var authGitHubRouter = express.Router();

// Third Party modules -----------------------------------------------------------
const passport = require('passport');
const session = require('express-session');
var GitHubStrategy = require('passport-github').Strategy;
const passportConfig = require('../config/configPassportGitHub');

const createErrorObject = require('../utils/createErrorObject.util');

// Functions ---------------------------------------------------------------------


// Runs for ALL routes ----------------------------------------------------------

// Setup Session for Passport
authGitHubRouter.use(session({
    secret: 'I love Canvas!',
    resave: false,
    saveUninitialized: true,
}))

// Passport related
authGitHubRouter.use(passport.initialize());
authGitHubRouter.use(passport.session());
passport.use(new GitHubStrategy(passportConfig,
  (accessToken, refreshToken, profile, cb) => {
    console.log(profile)
    return cb(null, profile);
  }
));

passport.serializeUser( (user, cb)=>{
    cb(null,user);
});

passport.deserializeUser((user,cb)=>{
    cb(null,user)
});


// Methods for this Router -----------------------------------------------------------

// authGitHub/login
authGitHubRouter.get('/login', passport.authenticate('github'));

authGitHubRouter.get('/callback', passport.authenticate('github',{
    successRedirect: '/',
    failureRedirect: '/loginFailed'
}));

authGitHubRouter.get('/loginSuccess', (req, res, next) => {
    res.json(
        createReturnObject(
            "success",
            "Login worked",
            [],
            "",
            "",
            "",
            "",
            ""
        )
    );
});

authGitHubRouter.get('/loginFailed', (req, res, next) => {
    res.json(
        createErrorObject(
            "failed",
            "Login failed",
            null
        )
    );
});

// authGitHub/logout
authGitHubRouter.get('/logout', (req, res, next) => {
    req.logout();
    req.session.destroy( () => {
        res.clearCookie('connect.sid');
        res.json(
            createReturnObject(
                "success",
                "Logged out",
                [],
                "",
                "",
                "",
                "",
                ""
            )
        );
    });
});


// Export -----------------------------------------------------------
module.exports = authGitHubRouter;
