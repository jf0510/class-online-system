/*createroom*/
$(function(){
	var socket = io();
	var $createButton = $('#create-room-button');
	var $people =  $('#people');
	console.log($people);
	$('#authorityInfo').popover({
		container: 'body'
	});
	
	$('#modeInfo').popover({
		container: 'body'
	});
	
	//submit
	$createButton.click(function(){
		var pincode = Math.floor(Math.random()*900000)+100000;
    	console.log("create room");
		var roomName = $('#roomName').val();
		var roomType = $('input[name=optradio]:checked').val();
		var roomAuthority = $('input[name=authority-optradio]:checked').val();
		console.log(roomType);
		debugger;
    	var roomMaximum = $('#people').val();
    	/*if(Number.isInteger(roomMaximum) ==false){
    		alert('人數上限輸入錯誤！');
    	}else{*/

	    	var info = {
	      		roomName : roomName,
				roomId : pincode,
				roomType : roomType,
				roomMaximum : roomMaximum,
				roomAuthority : roomAuthority
	    	}
			socket.emit('create room', info);
			//window.location.href = '/chats/' + id;
    	//}
	});

	socket.on('redirect to room', function (data) {
		//alert(data.id);
		window.location.href = '/chats/' + data.id;
	});
	$('.redir').click(function(){
  	$('#nologinWarn').modal('hide');
  	});
  	
  	$('#createNewChatroom').on('shown.bs.modal', function(){
  		socket.emit('check login');
  	});
  	socket.on('redirect to login page', function(){
    	console.log('show redirect modal!');
    	$('#nologinWarn').modal('show'); 
    	$('#createNewChatroom').modal('hide'); 
  	});
  	socket.on('redirect to dir', function(dir){
  		window.location.href = dir;
  	});
  	socket.on('error alert', function(data){
  		alert(data.error, data.msg);
  	});
});