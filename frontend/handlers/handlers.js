var http = require('http');
var math = require('math');
var querystring = require('querystring');

//tcp
var dockerHost = '127.0.0.1'
var dockerPort = 4243
var dockerProto = 'http'
var dockerURL = dockerProto + '://' + dockerHost + ':' + dockerPort

//unix domain socket
var socketFile='/var/run/docker.sock';

var dockerApiVersion = 'v1.23'

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
	var options = {
		//hostname: dockerHost,
		//port: dockerPort,
		socketPath:socketFile,
		path: '/' + dockerApiVersion + '/containers/json?all=1',
		method: 'GET'
	};

	var req_docker = http.request(options, function(res_docker){
		var buf = '';
		res_docker.setEncoding('utf8');
		res_docker.on('data', function(chunk){
			buf += chunk;
		});

		res_docker.on('end', function(){
			var list = [];
			var objs = JSON.parse(buf);
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

				var name = '---';
				if(objs[i].Names != undefined){
					name = objs[i].Names[0].substr(1)
				}
				var image = '';
				if(-1 == objs[i].Image.indexOf('sha256:')){
					image = objs[i].Image
				}else{
					image = objs[i].Image.split("sha256:")[1].substr(0, 12)
				}
				list.push({'sn': i + 1, 'name': name, 'image':image, 'ipAddress': objs[i].IPAddress, 'created':new Date(parseInt(objs[i].Created) * 1000).toLocaleString(), 'status':{'stat': status, 'description':objs[i].Status }});
			}
			res.send({'list':list});
		});
	}).on('error', function(e){
		console.log(e.message);
	});
	req_docker.end();
}

exports.imageList = function(req, res){
	var options = {
		//hostname: dockerHost,
		//port: dockerPort,
		socketPath:socketFile,
		path: '/' + dockerApiVersion + '/images/json',
		method: 'GET'
	};

	var req_docker = http.request(options, function(res_docker){
		var buf = '';
		res_docker.setEncoding('utf8');
		res_docker.on('data', function(chunk){
			buf += chunk;
		});

		res_docker.on('end', function(){
			var list = [];
			var objs = JSON.parse(buf);
			for (var i = 0; i < objs.length; i++) {
				list.push({'sn': i + 1, 'name': objs[i].RepoTags[0].split(':')[0], 'tag':objs[i].RepoTags[0].split(':')[1], 'id':objs[i].Id.split(":")[1].substr(0, 12), 'created': new Date(parseInt(objs[i].Created) * 1000).toLocaleString() ,'size':math.round(objs[i].VirtualSize / 1024 / 1024)});
			}
			res.send({'list':list});
		});
	}).on('error', function(e){
		console.log(e.message);
	});
	req_docker.end();
}

exports.volumeList = function(req, res){
	var options = {
		//hostname: dockerHost,
		//port: dockerPort,
		socketPath:socketFile,
		path: '/' + dockerApiVersion + '/volumes',
		method: 'GET'
	};

	var req_docker = http.request(options, function(res_docker){
		var buf = '';
		res_docker.setEncoding('utf8');
		res_docker.on('data', function(chunk){
			buf += chunk;
		});

		res_docker.on('end', function(){
			var list = [];
			var obj = JSON.parse(buf);
			for (var i = 0; i < obj.Volumes.length; i++) {
				list.push({'sn': i + 1, 'name': obj.Volumes[i].Name, 'driver': obj.Volumes[i].Driver});
			}
			res.send({'list':list});
		});
	}).on('error', function(e){
		console.log(e.message);
	});
	req_docker.end();
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
	postCreateContainer(JSON.parse(req.body.data));
	res.send('processing');
}

exports.createVolume = function(req, res){
	postCreateVolume(req.body);
	res.send('processing');
}

function postDoContainer(action, name){
	var postData = querystring.stringify({});
	var options = {
		//hostname: dockerHost,
		//port: dockerPort,
		socketPath:socketFile,
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
		//hostname: dockerHost,
		//port: dockerPort,
		socketPath:socketFile,
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
	    "AttachStdin": false,
	    "AttachStdout": false,
	    "AttachStderr": false,
	    "Tty": false,
	    "OpenStdin": false,
	    "StdinOnce": false,
	    "Env": [],
	    "Cmd": [
	        "bash"
	    ],
	    "Image": "",
	    "Volumes": {},
	    "WorkingDir": "",
	    "Entrypoint": null,
	    "OnBuild": null,
	    "Labels": {},
	    "HostConfig": {
	        "Binds": [],
	        "ContainerIDFile": "",
	        "LogConfig": {
	            "Type": "",
	            "Config": {}
	        },
	        "NetworkMode": "default",
	        "PortBindings": {},
	        "RestartPolicy": {
	            "Name": "no",
	            "MaximumRetryCount": 0
	        },
	        "AutoRemove": false,
	        "VolumeDriver": "",
	        "VolumesFrom": null,
	        "CapAdd": null,
	        "CapDrop": null,
	        "Dns": [],
	        "DnsOptions": [],
	        "DnsSearch": [],
	        "ExtraHosts": null,
	        "GroupAdd": null,
	        "IpcMode": "",
	        "Cgroup": "",
	        "Links": null,
	        "OomScoreAdj": 0,
	        "PidMode": "",
	        "Privileged": false,
	        "PublishAllPorts": false,
	        "ReadonlyRootfs": false,
	        "SecurityOpt": null,
	        "StorageOpt": null,
	        "UTSMode": "",
	        "UsernsMode": "",
	        "ShmSize": 0,
	        "ConsoleSize": [
	            0,
	            0
	        ],
	        "Isolation": "",
	        "CpuShares": 0,
	        "Memory": 0,
	        "CgroupParent": "",
	        "BlkioWeight": 0,
	        "BlkioWeightDevice": null,
	        "BlkioDeviceReadBps": null,
	        "BlkioDeviceWriteBps": null,
	        "BlkioDeviceReadIOps": null,
	        "BlkioDeviceWriteIOps": null,
	        "CpuPeriod": 0,
	        "CpuQuota": 0,
	        "CpusetCpus": "",
	        "CpusetMems": "",
	        "Devices": [],
	        "DiskQuota": 0,
	        "KernelMemory": 0,
	        "MemoryReservation": 0,
	        "MemorySwap": 0,
	        "MemorySwappiness": -1,
	        "OomKillDisable": false,
	        "PidsLimit": 0,
	        "Ulimits": null,
	        "CpuCount": 0,
	        "CpuPercent": 0,
	        "BlkioIOps": 0,
	        "BlkioBps": 0,
	        "SandboxSize": 0
	    },
	    "NetworkingConfig": {
	        "EndpointsConfig": {}
	    }
	}

	//populate data
	opt_template.Image = opt.Image;
	for (var i = opt.HostConfig.Binds.length - 1; i >= 0; i--) {
		opt_template.HostConfig.Binds.push(opt.HostConfig.Binds[i])	
	}

	var postData = JSON.stringify(opt_template);
	console.log(postData);

	var options = {
		//hostname: dockerHost,
		//port: dockerPort,
		socketPath:socketFile,
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

function postCreateVolume(opt){
	var opt_template = {
		"Name":"",
		"Driver":"local",
		"DriverOpts":{},
		"Labels":{}
	};

	for(x in opt)
	{
		if(x in opt_template){
			opt_template[x] = opt[x];
		}
	}

	var postData = JSON.stringify(opt_template);
	console.log(postData);

	var options = {
		//hostname: dockerHost,
		//port: dockerPort,
		socketPath:socketFile,
		path: '/' + dockerApiVersion + '/volumes/create',
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

exports.removeVolume = function(req, res){
	var name = req.params.name;

	var postData = querystring.stringify({});
	var options = {
		//hostname: dockerHost,
		//port: dockerPort,
		socketPath:socketFile,
		path: '/' + dockerApiVersion + '/volumes/' + name,
		method: 'DELETE',
		headers:{
		    'Content-Type': 'application/x-www-form-urlencoded',
		    'Content-Length': postData.length
		}
	};

	var req_docker = http.request(options, function(res_docker){
		var buf = '';
		res_docker.setEncoding('utf8');
		res_docker.on('data', function(chunk){
			buf += chunk;
		});

		res_docker.on('end', function(){
			res.end(buf);
		});
	});

	req_docker.on('error', function(e){
		console.log(e.message);
	});

	req_docker.write(postData);
	req_docker.end();
}

exports.volume = function(req, res){
	res.render('volume');
}

exports.node = function(req, res){
	res.send('To be continued...')
}