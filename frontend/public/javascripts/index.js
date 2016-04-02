$(document).ready(function(){
	$(".leftsidebar_box .nav_item").click(function(){
		$(".leftsidebar_box .nav_item").css({"background-color":"#2F4F4F"})
		$(this).css({"background-color": "#1F3F3F"});
		$('#mytitle').text($(this).text());
	});
	$('#id_iframe_a').css({'height':$(window).height() - 90});
});