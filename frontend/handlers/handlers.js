exports.container = function(req, resp){
	var title = 'Container List';
	var list = [];
	for(var i = 1; i < 11; i++){
		list.push({'sn':i, 'name':'cdm' + (i < 100 ? (i < 10 ? '00' + i : '0' + i ): i), 'image':'cdm:D115SP93', 'Addr':'207.207.90.' + i, 'status':{'stat':'success', 'description':'运行中'}, 'created':'2016-1-25 2:25:16'});
	}
	resp.render('container', {'list':list});
}

exports.summary = function(req, resp){
	resp.render('summary');
}

exports.image = function(req, resp){
	resp.render('image');
}