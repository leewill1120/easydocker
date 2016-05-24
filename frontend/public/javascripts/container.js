var totalPage = 0;
var currentPage = 0;
var containerList = [];
var searchList = [];
var serachMode = false;

function test(){
	alert('This is a test');
}

function openConsole(name){
	//alert(name);
}

function createContainer(option){
	$.post('/createContainer', {data:JSON.stringify(option)}, function(data, status){ // !!!important
		window.setTimeout(reloadContainerList, 1000);
	});
}

function startContainer(name){
	$.post('/doContainer', {action:'start', name:name}, function(data, status){
		window.setTimeout(reloadContainerList, 1000);
	});
}

function pauseContainer(name){
	$.post('/doContainer', {action:'pause', name:name}, function(data, status){
		window.setTimeout(reloadContainerList, 1000);
	});
}

function unpauseContainer(name){
	$.post('/doContainer', {action:'unpause', name:name}, function(data, status){
		window.setTimeout(reloadContainerList, 1000);
	});
}

function stopContainer(name){
	$.post('/doContainer', {action:'stop', name:name}, function(data, status){
		window.setTimeout(reloadContainerList, 1000);
	});
}

function removeContainer(name){
	$.post('/doContainer', {action:'remove', name:name}, function(data, status){
		window.setTimeout(reloadContainerList, 1000);
	});
}

function addItemToTable(tableId, item){
	var tableBody = $('#' + tableId);

	var tr = $('<tr></tr>').appendTo(tableBody);

	var td = $('<td style="padding-left:50px;"></td>').appendTo(tr);
	var span = $('<span class="class1"></span>').appendTo(td);
	span.append(item.sn);

	td = $('<td></td>').appendTo(tr);
	span = $('<span class="class1"></span>').appendTo(td);
	span.append(item.name);

	td = $('<td></td>').appendTo(tr);
	span = $('<span class="class1"></span>').appendTo(td);
	span.append(item.image);

	td = $('<td></td>').appendTo(tr);
	span = $('<span class="class1"></span>').appendTo(td);
	span.append(item.ipAddress);

	td = $('<td></td>').appendTo(tr);
	span = $('<span class="class1"></span>').appendTo(td);
	span.append(item.created);

	td = $('<td></td>').appendTo(tr);
	span = $('<span class="class1 label"></span>').appendTo(td);
	span.addClass('label-' + item.status.stat);
	span.append(item.status.description);

	td = $('<td></td>').appendTo(tr);
	var btn_group = $('<div class="btn-group"></div>').appendTo(td);
	$('<button class="btn btn-primary" onclick="javascript:openConsole(\'' + item.name + '\');">控制台</button>').appendTo(btn_group);
	var btn = $('<button class="btn btn-primary dropdown-toggle" data-toggle="dropdown"></button>').appendTo(btn_group);
	$('<span class="caret"></span>').appendTo(btn);
	var ul = $('<ul class="dropdown-menu" role="menu"></ul>').appendTo(btn_group);

	var li = $('<li role="presentition"></li>').appendTo(ul);
	var a = $('<a role="menuitem" href="javascript:startContainer(\'' + item.name + '\');"></a>').appendTo(li);
	span = $('<span class="glyphicon glyphicon-play">启动容器</span>').appendTo(a);


	li = $('<li role="presentition"></li>').appendTo(ul);
	a = $('<a role="menuitem" href="javascript:stopContainer(\'' + item.name + '\');"></a>').appendTo(li);
	span = $('<span class="glyphicon glyphicon-stop">停止容器</span>').appendTo(a);

	li = $('<li role="presentition"></li>').appendTo(ul);
	a = $('<a role="menuitem" href="javascript:pauseContainer(\'' + item.name + '\');"></a>').appendTo(li);
	span = $('<span class="glyphicon glyphicon-pause">暂停运行</span>').appendTo(a);

	li = $('<li role="presentition"></li>').appendTo(ul);
	a = $('<a role="menuitem" href="javascript:unpauseContainer(\'' + item.name + '\');"></a>').appendTo(li);
	span = $('<span class="glyphicon glyphicon-forward">继续运行</span>').appendTo(a);

	$('<li class="divider" role="presentition"></li>').appendTo(ul);
	$('<li class="dropdown-header" role="presentition">危险操作区</li>').appendTo(ul);

	li = $('<li role="presentition"></li>').appendTo(ul);
	a = $('<a role="menuitem" href="javascript:removeContainer(\'' + item.name + '\');"></a>').appendTo(li);
	span = $('<span class="glyphicon glyphicon-remove">删除容器</span>').appendTo(a);
}

function getContainerList(callback){
	$.get('/containerlist', function(data, status){
		if('success' == status){
			containerList = data.list;
			var cap = getTableCap();
			totalPage = Math.ceil(data.list.length / cap);
			for (var i = 0; i < cap && i < data.list.length; i++) {
				addItemToTable('id_table_body', containerList[i]);
			}
			if(callback != undefined){
				callback();
			}
		}else{
			console.log(status);
		}
	});
}

function cleanUpTable(){
	$('#id_ul_page').empty();
	$('#id_table_body').empty();
}

function reloadContainerList(){
	cleanUpTable();
	getContainerList(function(){
		if(0 < totalPage){
			printPageInfo(currentPage, totalPage, "id_table_body", "id_ul_page");
		}
		goToPage(currentPage);
	});
}

function goToPage(page){
	var targetList = [];
	if(serachMode == true){
		targetList = searchList;
		totalPage = Math.ceil(searchList.length / getTableCap());
	}else{
		targetList = containerList;
		totalPage = Math.ceil(containerList.length / getTableCap());
	}
	
	emptyTable('id_table_body');
	currentPage = page;
	var cap = getTableCap();
	for (var i = 0; i < cap; i++) {
		if((i + (currentPage - 1) * cap) < targetList.length)
		{
			addItemToTable('id_table_body', targetList[i + (currentPage - 1) * cap]);
		}
	}
	var children = $('#id_ul_page').children();
	for (var i = 1; i < children.length - 1; i++) {
		if( page == parseInt($($(children[i]).children()[0]).text())){
			$(children[i]).addClass('active');
		}else{
			$(children[i]).removeClass('active');
		}
	}
	updatePageInfoPos("id_ul_page");
}

function searchContainer(keyword){
	searchList = [];
	if(keyword == ''){
		serachMode = false;
	}else{
		serachMode = true;
	}
	
	for (var i = 0; i < containerList.length; i++) {
		if( -1 != containerList[i].name.toLowerCase().indexOf(keyword.toLowerCase()) || -1 != containerList[i].ipAddress.toLowerCase().indexOf(keyword.toLowerCase()))
		searchList.push(containerList[i]);
	}

	currentPage = 1;
	var cap = getTableCap();
	emptyTable('id_table_body');
	for (var i = 0; i < cap; i++) {
		if((i + (currentPage - 1) * cap) < searchList.length)
		{
			addItemToTable('id_table_body', searchList[i + (currentPage - 1) * cap]);
		}
	}
	$('#id_ul_page').empty();
	printPageInfo(currentPage, Math.ceil(searchList.length / cap), "id_table_body", "id_ul_page");
}

$(document).ready(function(){
	$('#id_btn_refresh').click(function(){
		reloadContainerList();
	});

	$('#id_search_input').keyup(function(){
		searchContainer($('#id_search_input').val());
	});

	$('#id_btn_submit').click(function(){
		var opt = {
			name: $('#form_name').val(),
			Image: $('#form_image').val(),
			HostConfig: {Binds: [$('#form_volume').val() + ':/root/ok']}
		};
		createContainer(opt);
	});

	$('#id_btn_create').click(function(){
		$('#form_create_container').empty();

		$('<label class="col-sm-2 control-label" for="form_name">名称</label>').appendTo($('<div class="form-group" id="form_name_grp"></div>').appendTo('#form_create_container'));
		$('<input class="form-control" type="text" placeholder="请输入名字" id="form_name">').appendTo($('<div class="col-sm-8"></div>').appendTo('#form_name_grp'));

		$('<label class="col-sm-2 control-label" for="form_image">镜像</label>').appendTo($('<div class="form-group" id="form_image_grp"></div>').appendTo('#form_create_container'));
		$('<select class="form-control" id="form_image"></select>').appendTo($('<div class="col-sm-8"></div>').appendTo('#form_image_grp'));

		$('<label class="col-sm-2 control-label" for="form_cmd">命令</label>').appendTo($('<div class="form-group" id="form_cmd_grp"></div>').appendTo('#form_create_container'));
		$('<input class="form-control" type="text" placeholder="如：/bin/bash" id="form_cmd">').appendTo($('<div class="col-sm-8"></div>').appendTo('#form_cmd_grp'));

		$('<label class="col-sm-2 control-label" for="form_volume">数据卷</label>').appendTo($('<div class="form-group" id="form_volume_grp"></div>').appendTo('#form_create_container'));
		$('<select class="form-control" id="form_volume"></select>').appendTo($('<div class="col-sm-8" id="div_vol"></div>').appendTo('#form_volume_grp'));
		$('<input class="form-control" type="text" placeholder="容器内挂载点，如：/var/lib/mysql" id="form_cmd">').appendTo('#div_vol');
		$('<option>无</option>').appendTo('#form_volume');

		$.get('/imageList', function(data, status){
			if('success' == status){
				imageList = data.list;
				for (var i = 0; i < imageList.length; i++) {
					if(imageList[i].name == '<none>' || imageList[i].tag == '<none>'){
						continue;
					}
					$('<option>' + imageList[i].name + ':' + imageList[i].tag + '</option>').appendTo('#form_image');
				}
				//
			}else{
				alert(status);
			}
		});

		$.get('/volumeList', function(data, status){
			if('success' == status){
				volumeList = data.list;
				for (var i = 0; i < volumeList.length; i++) {
					$('<option>' + volumeList[i].name + '</option>').appendTo('#form_volume');
				}
				//
			}else{
				alert(status);
			}
		});
	});

	currentPage = 1;
	getContainerList(function(){
		if(0 < totalPage){
			printPageInfo(currentPage, totalPage, "id_table_body", "id_ul_page");
		}
	});
});