var express = require('express');
var router = express.Router();
var handlers = require('../handlers')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'easyDocker' });
});

//页面
router.get('/container', handlers.container);

router.get('/summary', handlers.summary);

router.get('/image', handlers.image);

router.get('/volume', handlers.volume);

router.get('/node', handlers.node);

//对象操作
router.get('/containerlist', handlers.containerlist);

router.get('/imageList', handlers.imageList);

router.get('/volumeList', handlers.volumeList);

router.post('/doContainer', handlers.doContainer);

router.post('/createContainer', handlers.createContainer);

router.post('/createVolume', handlers.createVolume);

router.delete('/removeVolume/:name', handlers.removeVolume);

module.exports = router;
