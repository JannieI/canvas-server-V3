// Basic imports -----------------------------------------------------------------
var express = require('express');
var authGitHubRouter = express.Router();

// Third Party modules -----------------------------------------------------------
const passport = require('passport');


// Functions ---------------------------------------------------------------------


// Runs for ALL routes ----------------------------------------------------------


// Methods for this Router -----------------------------------------------------------

// authGitHub/login
authGitHubRouter.get('/login', passport.authenticate('github'));

authGitHubRouter.get('/callback', passport.authenticate('github',{
    successRedirect: '/',
    failureRedirect: '/loginFailed'
}));

authGitHubRouter.get('/loginSuccess', (req, res, next) => {
    res.json( {msg: 'Login worked !'} );
});

authGitHubRouter.get('/loginFailed', (req, res, next) => {
    res.json( {msg: 'Login failed'} );
});

// authGitHub/logout
authGitHubRouter.get('/logout', (req, res, next) => {
    req.logout();
    req.session.destroy( () => {
        res.clearCookie('connect.sid');
        res.json( {msg: "Logged out"} );
    });
});


// Export -----------------------------------------------------------
module.exports = authGitHubRouter;
