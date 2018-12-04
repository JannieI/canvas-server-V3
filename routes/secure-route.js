const express = require('express');

const router = express.Router();

//Lets say the route below is very sensitive and we want only authorized users to have access

//Displays information tailored according to the logged in user
// http://localhost:8000/profile?secret_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjVjMDY5Mzk0NGFmOGU2MTI3MzM5NTI3YiIsImVtYWlsIjoiamFubmllQGdtYWlsLmNvbSJ9LCJpYXQiOjE1NDM5MzY2MDN9.Afzce20uW74zK_qqpn9X-H3p0xSRLS61nJhvMKozbq0
router.get('/profile', (req, res, next) => {
  //We'll just send back the user details and the token
  res.json({
    message : 'You made it to the secure route',
    user : req.user,
    token : req.query.secret_token
  })
});

module.exports = router;