// Google OAuth config
// https://console.developers.google.com/apis/credentials My Project 60471
module.exports = {
    clientID: '837537281909-7budchnuf8ccq49ds88un3np8jqr2kbu.apps.googleusercontent.com',
    clientSecret: 'aZOF8mBB-AcaYCp0KUCRNgyo',
    callbackURL: "http://localhost:8000/auth/google/callback"
}


// Message from Google Playground
// {
//     "access_token": "ya29.GltlBueQFf3Dt4eHn0c4ddSAOCafnLFW0FuXeo180YR5CckXw3fNwFN0hSBbwliVVGp0lfGx_84lkndfgzdXBFGCxeJyXxgNbiDvR5K6JmZhRZF28MNbP29MWp2a", 
//     "scope": "https://mail.google.com/", 
//     "token_type": "Bearer", 
//     "expires_in": 3600, 
//     "refresh_token": "1/2uVvqobhqarTXd0o_dZvhHrfOKzLzaUuBLipGEnhK5Y"
// }


var auth = {
    type: 'oauth2',
    user: 'jimmelman@gmail.com',
    clientId: '837537281909-7budchnuf8ccq49ds88un3np8jqr2kbu.apps.googleusercontent.com',
    clientSecret: 'aZOF8mBB-AcaYCp0KUCRNgyo',
    refreshToken: '1/2uVvqobhqarTXd0o_dZvhHrfOKzLzaUuBLipGEnhK5Y',
};
