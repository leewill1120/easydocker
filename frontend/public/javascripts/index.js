$(document).ready(function(){
	$(".leftsidebar_box .nav_item").click(function(){
		$(".leftsidebar_box .nav_item").css({"background-color":"#2F4F4F"})
		$(this).css({"background-color": "#1F3F3F"});
		$('#mytitle').text($(this).text());
	});
	$('#id_iframe_a').css({'height':$(window).height() - 90});
	var padding_width = parseInt($('#id_iframe_a').css("padding-left")); //使用padding-left代替padding FROM:http://stackoverflow.com/questions/15497246/jquery-csspadding-issue-with-firefox
	var leftsidebarWidth = parseInt($('#id_leftsidebar').css('width'));
	$('#id_iframe_a').width(document.body.clientWidth - leftsidebarWidth - padding_width * 2 );
	$('#id_logo').css('padding-left', ($('#id_leftsidebar').width() - $('#id_logo_context').width()) / 2 - 2);
});