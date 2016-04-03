function leftPageBar(id_page){
	var children = $('#' + id_page).children();
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

function rightPageBar(id_page){
	var children = $('#' + id_page).children();
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

function emptyTable(table_body_id){
	$('#' + table_body_id).empty();
}

function nextPage(id_table_body, id_page){
	var targetList = [];
	if(serachMode == true){
		targetList = searchList;
		totalPage = Math.ceil(searchList.length / getTableCap());
	}else{
		targetList = containerList;
		totalPage = Math.ceil(containerList.length / getTableCap());
	}

	if(currentPage < totalPage){
		emptyTable(id_table_body);
		currentPage++;

		var cap = getTableCap();
		for (var i = 0; i < cap; i++) {
			if((i + (currentPage - 1) * cap) < targetList.length)
			{
				addItemToTable(id_table_body, targetList[i + (currentPage - 1) * cap]);
			}
		}

		var children = $('#' + id_page).children();
		if(currentPage == 1 + parseInt($($(children[children.length - 4]).children()[0]).text())){
			rightPageBar(id_page);
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

function prePage(id_table_body, id_page){
	var targetList = [];
	if(serachMode == true){
		targetList = searchList;
	}else{
		targetList = containerList;
	}

	if(currentPage > 1){
		emptyTable(id_table_body);
		currentPage--;

		var cap = getTableCap();
		for (var i = 0; i < cap; i++) {
			if((i + (currentPage - 1) * cap) < targetList.length)
			{
				addItemToTable(id_table_body, targetList[i + (currentPage - 1) * cap]);
			}
		}

		var children = $('#' + id_page).children();
		if(currentPage + 1 == parseInt($($(children[1]).children()[0]).text())){
			leftPageBar(id_page);
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

function getTableCap(){
	var count = Math.floor(($(window).height() - 150 ) / 51);
	if(count < 1){
		count = 1;
	}
	return count;
}

function printPageInfo(current, total, id_table_body, id_ul_page){
	var li = $('<li></li>').appendTo($('#' + id_ul_page));
	var a = $('<a href="javascript:prePage(\'id_table_body\', \'id_ul_page\');">&laquo</a>').appendTo(li);

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
	$('<a href="javascript:nextPage(\'id_table_body\', \'id_ul_page\');">&raquo</a>').appendTo(li);

	updatePageInfoPos(id_ul_page);
}

function updatePageInfoPos(id_ul_page){
	var w = 0;
	var list = $('#' + id_ul_page).children();
	for (var i = 0; i < list.length; i++) {
		w += $($(list[i]).children()[0]).innerWidth();
	}
	pos = ($(window).width() - w) / 2;

	$('#' + id_ul_page).css({'margin-left':pos});
}