var express = require('express');
var router = express.Router();
var handlers = require('../handlers')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/container', handlers.container);

module.exports = router;
