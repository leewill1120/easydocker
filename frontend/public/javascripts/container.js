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
	$.post('/createContainer', option, function(data, status){});
	//window.location.reload();
}

function startContainer(name){
	$.post('/doContainer', {action:'start', name:name}, function(data, status){});
	window.location.reload();
}

function pauseContainer(name){
	$.post('/doContainer', {action:'pause', name:name}, function(data, status){});
	window.location.reload();
}

function unpauseContainer(name){
	$.post('/doContainer', {action:'unpause', name:name}, function(data, status){});
	window.location.reload();
}

function stopContainer(name){
	$.post('/doContainer', {action:'stop', name:name}, function(data, status){});
	window.location.reload();
}

function removeContainer(name){
	$.post('/doContainer', {action:'remove', name:name}, function(data, status){});
	window.location.reload();
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

function goToPage(page){
	if(currentPage == page){
		return;
	}else{
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
			if(page == totalPage){
				$($(children[i]).children()[0]).text( totalPage - 10 + i);
				$($(children[i]).children()[0]).attr('href', 'javascript:goToPage(' + (totalPage - 10 + i) + ');');
			}
		}
		updatePageInfoPos("id_ul_page");
	}
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
		window.location.reload();
	});

	$('#id_search_input').keyup(function(){
		searchContainer($('#id_search_input').val());
	});

	$('#id_btn_submit').click(function(){
		var opt = {
			name: $('#form_name').val(),
			Image: $('#form_image').val(),
			IPAddress: $('#form_ipAddress').val()
		};
		createContainer(opt);
	});

	$('#id_btn_create').click(function(){
		$.get('/imageList', function(data, status){
			if('success' == status){
				imageList = data.list;
				for (var i = 0; i < imageList.length; i++) {
					if(imageList[i].name == '<none>' || imageList[i].tag == '<none>'){
						continue;
					}
					$('<option>' + imageList[i].name + ':' + imageList[i].tag + '</option>').appendTo('#form_image');
				}
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