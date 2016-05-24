var totalPage = 0;
var currentPage = 0;
var volumeList = [];
var searchList = [];
var serachMode = false;

function test(){
	alert('This is a test');
}


function removeVolume(name){
	$.ajax({
		url:'/removeVolume/' + name,
		type:'DELETE',
		success:function(result){
			window.setTimeout(reloadVolumeList, 1000);
		}
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
	if(item.name.trim() == '<none>'){
		span.append('---');
	}else{
		span.append(item.name);
	}

	td = $('<td></td>').appendTo(tr);
	span = $('<span class="class1"></span>').appendTo(td);
	span.append(item.driver);

	td = $('<td></td>').appendTo(tr);
	var btn_group = $('<div class="btn-group"></div>').appendTo(td);
	$('<button class="btn btn-primary" onclick="javascript:openConsole(\'' + item.name + '\');">更多</button>').appendTo(btn_group);
	var btn = $('<button class="btn btn-primary dropdown-toggle" data-toggle="dropdown"></button>').appendTo(btn_group);
	$('<span class="caret"></span>').appendTo(btn);
	var ul = $('<ul class="dropdown-menu" role="menu"></ul>').appendTo(btn_group);

	li = $('<li role="presentition"></li>').appendTo(ul);
	a = $('<a role="menuitem" href="javascript:removeVolume(\'' + item.name + '\');"></a>').appendTo(li);
	span = $('<span class="glyphicon glyphicon-remove">删除卷</span>').appendTo(a);
}

function getVolumeList(callback){
	$.get('/volumeList', function(data, status){
		if('success' == status){
			volumeList = data.list;
			var cap = getTableCap();
			totalPage = Math.ceil(data.list.length / cap);
			for (var i = 0; i < cap && i < data.list.length; i++) {
				addItemToTable('id_table_body', volumeList[i]);
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
			targetList = volumeList;
			totalPage = Math.ceil(volumeList.length / getTableCap());
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
		updatePageInfoPos();
	}
}

function searchVolume(keyword){
	searchList = [];
	if(keyword == ''){
		serachMode = false;
	}else{
		serachMode = true;
	}
	
	for (var i = 0; i < volumeList.length; i++) {
		if( -1 != volumeList[i].name.toLowerCase().indexOf(keyword.toLowerCase()) || -1 != volumeList[i].tag.toLowerCase().indexOf(keyword.toLowerCase()) || -1 != volumeList[i].id.toLowerCase().indexOf(keyword.toLowerCase()))
		searchList.push(volumeList[i]);
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

function cleanUpTable(){
	$('#id_ul_page').empty();
	$('#id_table_body').empty();
}


function reloadVolumeList(){
	cleanUpTable();
	getVolumeList(function(){
		if(0 < totalPage){
			printPageInfo(currentPage, totalPage, "id_table_body", "id_ul_page");
		}
		goToPage(currentPage);
	});
}

function createVolume(option){
	$.post('/createVolume', option, function(data, status){
		window.setTimeout(reloadVolumeList, 1000);
	});
}

$(document).ready(function(){
	$('#id_btn_create').click(function(){
		$('#form_create_volume').empty();

		$('<label class="col-sm-2 control-label" for="form_name">名称</label>').appendTo($('<div class="form-group" id="form_name_grp"></div>').appendTo('#form_create_volume'));
		$('<input class="form-control" type="text" placeholder="请输入名字" id="form_name">').appendTo($('<div class="col-sm-8"></div>').appendTo('#form_name_grp'));

		$('<label class="col-sm-2 control-label" for="form_driver">驱动类型</label>').appendTo($('<div class="form-group" id="form_driver_grp"></div>').appendTo('#form_create_volume'));
		$('<select class="form-control" id="form_driver"></select>').appendTo($('<div class="col-sm-8"></div>').appendTo('#form_driver_grp'));
		$('<option>local</option>').appendTo('#form_driver');
	});	

	$('#id_btn_submit').click(function(){
		var opt = {
			Name: $('#form_name').val(),
			Driver: $('#form_driver').val(),
		};
		createVolume(opt);
	});

	$('#id_btn_refresh').click(function(){
		window.location.reload();
	});

	$('#id_search_input').keyup(function(){
		searchImage($('#id_search_input').val());
	});

	currentPage = 1;
	getVolumeList(function(){
		if(0 < totalPage){
			printPageInfo(currentPage, totalPage, "id_table_body", "id_ul_page");
		}
	});
});