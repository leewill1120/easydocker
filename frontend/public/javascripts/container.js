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

function startContainer(name){
	alert('startContainer');
}

function pauseContainer(name){
	alert('pauseContainer');
}

function stopContainer(name){
	alert('stopContainer');
}

function removeContainer(name){
	alert('removeContainer');
}

function getTableCap(){
	var count = Math.floor(($(window).height() - 150 ) / 51);
	if(count < 1){
		count = 1;
	}
	return count;
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
	if(item.status.stat == 'success'){
		span.addClass('label-success');
	}else{
		span.addClass('label-danger');
	}
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
	a = $('<a role="menuitem" href="javascript:pauseContainer(\'' + item.name + '\');"></a>').appendTo(li);
	span = $('<span class="glyphicon glyphicon-pause">暂停容器</span>').appendTo(a);

	li = $('<li role="presentition"></li>').appendTo(ul);
	a = $('<a role="menuitem" href="javascript:stopContainer(\'' + item.name + '\');"></a>').appendTo(li);
	span = $('<span class="glyphicon glyphicon-stop">停止容器</span>').appendTo(a);

	$('<li class="divider" role="presentition"></li>').appendTo(ul);
	$('<li class="dropdown-header" role="presentition">危险操作区</li>').appendTo(ul);

	li = $('<li role="presentition"></li>').appendTo(ul);
	a = $('<a role="menuitem" href="javascript:removeContainer(\'' + item.name + '\');"></a>').appendTo(li);
	span = $('<span class="glyphicon glyphicon-remove">删除容器</span>').appendTo(a);
}

function emptyTable(table_body_id){
	$('#' + table_body_id).empty();
}

function getContainerList(callback){
	$.get('/containerlist', function(data, status){
		if('success' == status){
			containerList = data.list;
			var cap = getTableCap();
			totalPage = Math.ceil(data.list.length / cap);
			for (var i = 0; i < cap; i++) {
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
		updatePageInfoPos();
	}
}

function printPageInfo(current, total){
	var li = $('<li></li>').appendTo($('#id_ul_page'));
	var a = $('<a href="javascript:prePage();">&laquo</a>').appendTo(li);

	if(total <= 10){
		for (var i = 1; i <= total; i++) {
			li = $('<li></li>').appendTo($('#id_ul_page'));
			a = $('<a href="javascript:goToPage(' + i + ');">' + i + '</a>').appendTo(li);
			if(current == i){
				li.addClass('active');
			}else{
				li.removeClass('active');
			}
		}
	}else{
		for (var i = current; i < current + 8; i++) {
			li = $('<li></li>').appendTo($('#id_ul_page'));
			a = $('<a href="javascript:goToPage(' + i + ');">' + i + '</a>').appendTo(li);
			if(current == i){
				li.addClass('active');
			}else{
				li.removeClass('active');
			}
		}
		li = $('<li></li>').appendTo($('#id_ul_page'));
		a = $('<a>...</a>').appendTo(li);
		li = $('<li></li>').appendTo($('#id_ul_page'));
		a = $('<a href="javascript:goToPage(' + total + ');">' + total + '</a>').appendTo(li);
	}

	li = $('<li></li>').appendTo($('#id_ul_page'));
	$('<a href="javascript:nextPage();">&raquo</a>').appendTo(li);

	updatePageInfoPos();
}

function updatePageInfoPos(){
	var w = 0;
	var list = $('#id_ul_page').children();
	for (var i = 0; i < list.length; i++) {
		w += $($(list[i]).children()[0]).innerWidth();
	}
	pos = ($(window).width() - w) / 2;

	$('#id_ul_page').css({'margin-left':pos});
}

function nextPage(){
	var targetList = [];
	if(serachMode == true){
		targetList = searchList;
		totalPage = Math.ceil(searchList.length / getTableCap());
	}else{
		targetList = containerList;
		totalPage = Math.ceil(containerList.length / getTableCap());
	}

	if(currentPage < totalPage){
		emptyTable('id_table_body');
		currentPage++;

		var cap = getTableCap();
		for (var i = 0; i < cap; i++) {
			if((i + (currentPage - 1) * cap) < targetList.length)
			{
				addItemToTable('id_table_body', targetList[i + (currentPage - 1) * cap]);
			}
		}

		var children = $('#id_ul_page').children();
		if(currentPage == 1 + parseInt($($(children[children.length - 4]).children()[0]).text())){
			rightPageBar();
		}
		for (var i = 1; i < children.length - 1; i++) {
			if( currentPage == parseInt($($(children[i]).children()[0]).text())){
				$(children[i]).addClass('active');
			}else{
				$(children[i]).removeClass('active');
			}
		}
	}
}

function prePage(){
	var targetList = [];
	if(serachMode == true){
		targetList = searchList;
	}else{
		targetList = containerList;
	}

	if(currentPage > 1){
		emptyTable('id_table_body');
		currentPage--;

		var cap = getTableCap();
		for (var i = 0; i < cap; i++) {
			if((i + (currentPage - 1) * cap) < targetList.length)
			{
				addItemToTable('id_table_body', targetList[i + (currentPage - 1) * cap]);
			}
		}

		var children = $('#id_ul_page').children();
		if(currentPage + 1 == parseInt($($(children[1]).children()[0]).text())){
			leftPageBar();
		}
		for (var i = 1; i < children.length - 1; i++) {
			if( currentPage == parseInt($($(children[i]).children()[0]).text())){
				$(children[i]).addClass('active');
			}else{
				$(children[i]).removeClass('active');
			}
		}
	}
}

function leftPageBar(){
	var children = $('#id_ul_page').children();
	if(parseInt($($(children[1]).children()[0]).text()) == 1){
		return;
	}else{
		for (var i = 1; i < children.length - 2; i++) {
			if( (i == children.length - 2 - 1) && (parseInt($($(children[i - 1]).children()[0]).text()) + 2 != parseInt($($(children[i + 1]).children()[0]).text()) )){
				$($(children[i]).children()[0]).text('...');
				$($(children[i]).children()[0]).removeAttr("href");
				continue;
			}
			if(isNaN($($(children[i]).children()[0]).text())){
				continue;
			}
			var num = parseInt($($(children[i]).children()[0]).text());
			$($(children[i]).children()[0]).text(num - 1);
			$($(children[i]).children()[0]).attr("href", "javascript:goToPage('" + (num - 1) + "');");
			updatePageInfoPos();
		}
	}
}

function rightPageBar(){
	var children = $('#id_ul_page').children();
	if( ! isNaN($(children[children.length - 3]).text()) ){
		return;
	}else{
		for (var i = 1; i < children.length - 2; i++) {
			if( (i == children.length - 2 - 1) && (parseInt($($(children[i - 1]).children()[0]).text()) + 2 == parseInt($($(children[i + 1]).children()[0]).text()) )){
				$($(children[i]).children()[0]).text(totalPage - 1);
				$($(children[i]).children()[0]).attr("href", "javascript:goToPage('" + (totalPage - 1) + "');");
				continue;
			}
			if(isNaN($($(children[i]).children()[0]).text())){
				continue;
			}
			var num = parseInt($($(children[i]).children()[0]).text());
			$($(children[i]).children()[0]).text(num + 1);
			$($(children[i]).children()[0]).attr("href", "javascript:goToPage('" + (num + 1) + "');");
			updatePageInfoPos();
		}
	}
}

function search(keyword){
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
	printPageInfo(currentPage, Math.ceil(searchList.length / cap));
}

$(document).ready(function(){
	$('#id_btn_refresh').click(function(){
		window.location.reload();
	});

	$('#id_search_input').keyup(function(){
		search($('#id_search_input').val());
	});

	currentPage = 1;
	getContainerList(function(){
		if(0 < totalPage){
			printPageInfo(currentPage, totalPage);
		}
	});
});