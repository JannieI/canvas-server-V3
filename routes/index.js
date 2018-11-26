var express = require('express');
var router = express.Router();

/* POST home page. */
router.post('/', function(req, res, next) {
  console.log('I AM in Post ...')
  res.type('html');
  res.send(`<h1> POST Home Page </h1>`);
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
