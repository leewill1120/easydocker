var http = require('http');
var url = require('url');
var util = require('util');
var math = require('math');

exports.container = function(req, res){
	var title = 'Container List';
	res.render('container');
}

exports.summary = function(req, res){
	res.render('summary');
}

exports.image = function(req, res){
	res.render('image');
}

exports.containerlist = function(req, res){
	var list = [];
	http.get('http://10.0.0.109:4243/containers/json?all=1', function(res_docker){
		res_docker.setEncoding('utf8');
		res_docker.on('data', function(chunk){
			var objs = JSON.parse(chunk);
			for (var i = 0; i < objs.length; i++) {
				var status = '';
				if('Up' == objs[i].Status.substr(0,2)){
					status = 'success';
				}else{
					status = 'danger';
				}
				list.push({'sn': i + 1, 'name': objs[i].Names[0].substr(1), 'image':objs[i].Image, 'ipAddress': '207.207.90.' + i, 'created':objs[i].Created, 'status':{'stat': status, 'description':objs[i].Status }});
			}
			res.send({'list':list});
		});
	}).on('error', function(e){
		console.log(e.message);
	});
}

exports.imageList = function(req, res){
	var list = [];
	http.get('http://10.0.0.109:4243/images/json', function(res_docker){
		res_docker.setEncoding('utf8');
		res_docker.on('data', function(chunk){
			var objs = JSON.parse(chunk);
			for (var i = 0; i < objs.length; i++) {
				list.push({'sn': i + 1, 'name': objs[i].RepoTags[0].split(':')[0], 'tag':objs[i].RepoTags[0].split(':')[1], 'id':objs[i].Id, 'created': new Date(parseInt(objs[i].Created) * 1000).toLocaleString() ,'size':math.round(objs[i].VirtualSize / 1024 / 1024)});
			}
			res.send({'list':list});
		});
	}).on('error', function(e){
		console.log(e.message);
	});
}