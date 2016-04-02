var totalPage = 0;
var currentPage = 0;

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

function getContainerList(start, end){
	$.get('/containerlist?start=' + start + '&end='+ end, function(data, status){
		if('success' == status){
			for (var i = 0; i < data.length; i++) {
				addItemToTable('id_table_body', data[i]);
			}
			totalPage = data.length;
			currentPage = 1;
			printPageInfo(currentPage, totalPage);
		}else{
			console.log(status);
		}
	});
}

function printPageInfo(current, total){
	var li = $('<li></li>').appendTo($('#id_ul_page'));
	var a = $('<a href="javascript:prePage();">&laquo</a>').appendTo(li);
	var pos =  0;

	if(total <= 10){
		for (var i = 1; i <= total; i++) {
			li = $('<li></li>').appendTo($('#id_ul_page'));
			a = $('<a>' + i + '</a>').appendTo(li);
			if(current == i){
				li.addClass('active');
			}else{
				li.removeClass('active');
			}
		}
		pos = ($(window).width() - (total + 2) * a.innerWidth()) / 2;
	}else{
		for (var i = current; i < current + 8; i++) {
			li = $('<li></li>').appendTo($('#id_ul_page'));
			a = $('<a>' + i + '</a>').appendTo(li);
			if(current == i){
				li.addClass('active');
			}else{
				li.removeClass('active');
			}
		}
		li = $('<li></li>').appendTo($('#id_ul_page'));
		a = $('<a>...</a>').appendTo(li);
		li = $('<li></li>').appendTo($('#id_ul_page'));
		a = $('<a>' + total + '</a>').appendTo(li);
		pos = ($(window).width() - 10 * a.innerWidth()) / 2;
	}

	li = $('<li></li>').appendTo($('#id_ul_page'));
	$('<a href="javascript:nextPage();">&raquo</a>').appendTo(li);

	$('#id_ul_page').css({'margin-left':pos});
}

function nextPage(){
	if(currentPage < totalPage){
		currentPage++;
		var children = $('#id_ul_page').children();
		for (var i = 0; i < children.length; i++) {
			if( currentPage == parseInt($($(children[i]).children()[0]).text())){
				$(children[i]).addClass('active');
			}else{
				$(children[i]).removeClass('active');
			}
		}
	}
}

function prePage(){
	if(currentPage > 1){
		currentPage--;
		var children = $('#id_ul_page').children();
		for (var i = 0; i < children.length; i++) {
			if( currentPage == parseInt($($(children[i]).children()[0]).text())){
				$(children[i]).addClass('active');
			}else{
				$(children[i]).removeClass('active');
			}
		}
	}
}

$(document).ready(function(){
	var count = Math.floor(($(window).height() - 150) / 51);

	$('#id_btn_refresh').click(function(){
		window.location.reload();
	});

	var start = 1;
	var end = start + count;
	getContainerList(start, end);
});