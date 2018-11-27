var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log('In Users Route')
  res.send('respond with a resource');
});

module.exports = router;
