var http = require('http');
var math = require('math');
var querystring = require('querystring');

var dockerHost = '192.168.1.103'
var dockerPort = 4243
var dockerProto = 'http'
var dockerURL = dockerProto + '://' + dockerHost + ':' + dockerPort
var dockerApiVersion = 'v1.20'

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
	http.get(dockerURL + '/containers/json?all=1', function(res_docker){
		var data = '';
		res_docker.setEncoding('utf8');
		res_docker.on('data', function(chunk){
			data += chunk;
		});
		res_docker.on('end', function(){
			var list = [];
			var objs = JSON.parse(data);
			for (var i = 0; i < objs.length; i++) {
				var status = '';
				if('Up' == objs[i].Status.substr(0,2)){
					status = 'success';
				}else if(objs[i].Status.indexOf('Removal In Progress') != -1){
					status = 'default';
				}else if(objs[i].Status.indexOf('Created') != -1){
					status = 'info';
				}else{
					status = 'danger';
				}

				var name = '---'
				if(objs[i].Names != undefined){
					name = objs[i].Names[0].substr(1)
				}
				list.push({'sn': i + 1, 'name': name, 'image':objs[i].Image, 'ipAddress': objs[i].IPAddress, 'created':new Date(parseInt(objs[i].Created) * 1000).toLocaleString(), 'status':{'stat': status, 'description':objs[i].Status }});
			}
			res.send({'list':list});
		});
	}).on('error', function(e){
		console.log(e.message);
	});
}

exports.imageList = function(req, res){
	http.get(dockerURL + '/images/json', function(res_docker){
		var data = '';
		res_docker.setEncoding('utf8');
		res_docker.on('data', function(chunk){
			data += chunk;
		});
		res_docker.on('end', function(){
			var list = [];
			var objs = JSON.parse(data);
			for (var i = 0; i < objs.length; i++) {
				list.push({'sn': i + 1, 'name': objs[i].RepoTags[0].split(':')[0], 'tag':objs[i].RepoTags[0].split(':')[1], 'id':objs[i].Id, 'created': new Date(parseInt(objs[i].Created) * 1000).toLocaleString() ,'size':math.round(objs[i].VirtualSize / 1024 / 1024)});
			}
			res.send({'list':list});
		});
	}).on('error', function(e){
		console.log(e.message);
	});
}

exports.doContainer = function(req, res){
	var action = req.body.action;
	var name = req.body.name;
	if( action == 'start' || action == 'pause' || action == 'stop' || action == 'unpause'){
		postDoContainer(action, name);
		res.end('processing');
	}else if(action == 'remove'){
		postDelContainer(name);
	}else{
		console.log('unknow action:' + action);
		res.end('unknow action' + action);
	}
}

exports.createContainer = function(req, res){
	postCreateContainer(req.body);
}

function postDoContainer(action, name){
	var postData = querystring.stringify({});
	var options = {
		hostname: dockerHost,
		port: dockerPort,
		path: '/' + dockerApiVersion + '/containers/' + name + '/' + action,
		method: 'POST',
		headers:{
		    'Content-Type': 'application/x-www-form-urlencoded',
		    'Content-Length': postData.length
		}
	};

	var req = http.request(options, function(res){
		var buf = '';
		res.setEncoding('utf8');
		res.on('data', function(chunk){
			buf += chunk;
		});

		res.on('end', function(){
			console.log(buf);
		});
	});

	req.on('error', function(e){
		console.log(e.message);
	});

	req.write(postData);
	req.end();
}

function postDelContainer(name){
	var postData = querystring.stringify({});
	var options = {
		hostname: dockerHost,
		port: dockerPort,
		path: '/' + dockerApiVersion + '/containers/' + name + '?force=1',
		method: 'DELETE',
		headers:{
		    'Content-Type': 'application/x-www-form-urlencoded',
		    'Content-Length': postData.length
		}
	};

	var req = http.request(options, function(res){
		var buf = '';
		res.setEncoding('utf8');
		res.on('data', function(chunk){
			buf += chunk;
		});

		res.on('end', function(){
			console.log(buf);
		});
	});

	req.on('error', function(e){
		console.log(e.message);
	});

	req.write(postData);
	req.end();
}

function postCreateContainer(opt){
	var opt_template = {
		"Hostname": "",
		"Domainname": "",
		"User": "",
		"Memory": 0,
		"MemorySwap": 0,
		"CpuShares": 0,
		"Cpuset": "",
		"AttachStdin": false,
		"AttachStdout": false,
		"AttachStderr": false,
		"PortSpecs": null,
		"ExposedPorts": {},
		"Tty": true,
		"OpenStdin": true,
		"StdinOnce": false,
		"Env": [],
		"Cmd": [
		    "bash"
		],
		"Image": "",
		"Volumes": {},
		"WorkingDir": "",
		"Entrypoint": null,
		"NetworkDisabled": false,
		"OnBuild": null,
		"IPAddress": ""
	}

	for(x in opt)
	{
		if(x in opt_template){
			opt_template[x] = opt[x];
		}
	}

	var postData = JSON.stringify(opt_template);
	console.log(postData);

	var options = {
		hostname: dockerHost,
		port: dockerPort,
		path: '/' + dockerApiVersion + '/containers/create?name=' + opt.name,
		method: 'POST',
		headers:{
		    'Content-Type': 'application/json',
		    'Content-Length': postData.length
		}
	};

	var req = http.request(options, function(res){
		var buf = '';
		res.setEncoding('utf8');
		res.on('data', function(chunk){
			buf += chunk;
		});

		res.on('end', function(){
			console.log(buf);
		});
	});

	req.on('error', function(e){
		console.log(e.message);
	});

	req.write(postData);
	req.end();
}