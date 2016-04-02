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
	for(var i = 1; i < 100; i++){
		list.push({'sn':i, 'name':'cdm' + (i < 100 ? (i < 10 ? '00' + i : '0' + i ): i), 'image':'cdm:D115SP93', 'ipAddress':'207.207.90.' + i, 'status':{'stat':'success', 'description':'运行中'}, 'created':'2016-1-25 2:25:16'});
	}

	var sendList = [];
	for (var i = parseInt(req.query.start) - 1; i < parseInt(req.query.end) - 1; i++) {
		if(i >= list.length){
			break;
		}
		sendList.push(list[i]);
	}
	res.send(sendList);
}