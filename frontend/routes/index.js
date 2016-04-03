var express = require('express');
var router = express.Router();
var handlers = require('../handlers')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'easyDocker' });
});

router.get('/container', handlers.container);

router.get('/summary', handlers.summary);

router.get('/image', handlers.image);

router.get('/containerlist', handlers.containerlist);

router.get('/imageList', handlers.imageList);

router.post('/doContainer', handlers.doContainer);

router.post('/createContainer', handlers.createContainer);

router.delete('/doContainer', handlers.doContainer);

module.exports = router;
