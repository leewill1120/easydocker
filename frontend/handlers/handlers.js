var http = require('http');
var math = require('math');
var querystring = require('querystring');

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
				}else if('' == objs[i].Status){
					status = 'danger';
					objs[i].Status = 'Stopped'
				}else{
					status = 'danger';
				}
				list.push({'sn': i + 1, 'name': objs[i].Names[0].substr(1), 'image':objs[i].Image, 'ipAddress': '207.207.90.' + i, 'created':new Date(parseInt(objs[i].Created) * 1000).toLocaleString(), 'status':{'stat': status, 'description':objs[i].Status }});
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
	postCreateContainer(req.body.name, req.body.option);
}

function postDoContainer(action, name){
	var postData = querystring.stringify({});
	var options = {
		hostname: '127.0.0.1',
		port: 4243,
		path: '/v1.14/containers/' + name + '/' + action,
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
		hostname: '127.0.0.1',
		port: 4243,
		path: '/v1.14/containers/' + name + '?force=1',
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

function postCreateContainer(name, opt){
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
		"Image": "docker.io/ubuntu",
		"Volumes": {},
		"WorkingDir": "",
		"Entrypoint": null,
		"NetworkDisabled": false,
		"OnBuild": null
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
		hostname: '127.0.0.1',
		port: 4243,
		path: '/v1.14/containers/create?name=' + name,
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