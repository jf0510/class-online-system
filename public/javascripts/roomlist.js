$(function () {
  //initialize variables
  var $listParent = $('.justify-content-center');
  var socket = io();

  var CardTemplate = function(){
    this.content = $('<div class="col-sm-6 col-11"><div class="card"><div class="card-header"></div>' +
    '<div class="card-body"><table class="table"><thead><tr><th></th><th></th></tr></thead>' +
    '<tbody><tr><td>人數上限</td><td> </td></tr>'+
    '<tr><td>權限設定</td><td> </td></tr>' +
    '<tr><td>聊天室模式</td><td> </td></tr></tbody></table></div>' +
    '<div class="card-footer"><div class="row">' +
    '<div class="col"> <a href="#" class="btn btn-secondary btn-block card-btn-go" role="button"><i data-feather="message-circle"></i></a> </div>' +
    '<div class="col"><button type="button" class="btn btn-warning btn-block card-btn" data-toggle="modal" data-target="#edit-template"><i data-feather="edit-2"></i></button></div>' +
    '<div class="col"><button type="button" class="btn btn-danger btn-block card-btn" data-toggle="modal" data-target="#remove-template"><i data-feather="x"></i></button></div>' +
    '</div></div></div></div>');
  }

  /*check available*/
  function checkstatus(){
    var status = socket.emit('get room status');
    console.log(status);
    return status;
  }

  /*turn on/off the input field*/
  function frontendONOFF(status){
      $messageInput.attr('disabled', !status);
      console.log($messageInput);
  }

  function showRoomList(data){
    //for (var i = 0 ; i < data.length; i++) {
      //console.log(i);
      var roomcard = new CardTemplate;
      //$span = '<span class="badge-info badge-pill mr-1"></span>' + data[i].name;
      roomcard.content.find('.card-header').text(data.info.name);
      roomcard.content.find('span').text(data.info.pincode); //pincode
      roomcard.content.find('td').eq(1).text(data.info.maximum); //maximum people

      if(data.info.private == 0){
        authority = "匿名使用者";
      }else{
        authority = "會員使用者";
      }
      roomcard.content.find('td').eq(3).text(authority); //authority

      if(data.info.type == "tradition"){
        type = "討論";
      }else{
        type = "投票排行榜";
      }
      roomcard.content.find('td').eq(5).text(type); //type

      roomcard.content.find('.card').attr('id', 'card-' + data.info.id);
      roomcard.content.find('a').attr('id', 'go-' + data.info.id);
      roomcard.content.find('button').eq(1).attr('id', 'remove-modal-' + data.info.id);
      if(data.isAdmin){
        roomcard.content.find('button').eq(0).attr('id', 'edit-modal-' + data.info.id);
      }else{
        roomcard.content.find('button').eq(0).remove();
      }
      $listParent.append(roomcard.content);
    //}
    feather.replace();
  }

  $(document).on('click', '.card-btn', function(){
    console.log('btn clicked');
    var pincode = $(this).attr('id').split('-')[2];
    var $card = $('#card-' + pincode);
    var modalType = $(this).attr('id').split('-')[0];
    var roomMaximum = $card.find('td').eq(1).text();
    var roomName = $card.find('.card-header').text();
    var roomAuthority = $card.find('td').eq(3).text();
    var roomType = $card.find('td').eq(5).text();
    console.log(modalType, pincode, roomMaximum, roomName, roomAuthority, roomType);

    if(modalType == "edit"){
      $('#edit-template').find('#roomName').val(roomName);
      $('#edit-template').find('#people').val(roomMaximum);
    }else{
      $('#remove-template').find('#remove-modal-title').text(roomName);
      $('#remove-template').find('td').eq(1).text(roomMaximum);
      $('#remove-template').find('td').eq(3).text(roomAuthority);
      $('#remove-template').find('td').eq(5).text(roomType);
      $('#remove-template').find('.btn-leave').attr('id', 'rowid-');
    }
  });

  $(document).on('click', '.card-btn-go', function(){
    console.log('go btn clicked');
    var id = $(this).attr('id').split('-')[1];
    socket.emit('reload room', {id: id});
  });

  $(document).on('click', '.btn-leave', function(){
    //console.log('leave btn clicked');
    var id = $('.card-btn-go').attr('id').split('-')[1];
    console.log(id);
    socket.emit('remove me from room', {id: id});
    window.location.href = '/roomlist';
  });

  //Keyboard events
  // $(window).keydown(function(event){
  //   if (!event.shiftKey && event.which === 13 && $messageInput.is(":focus")) {  //'ENTER'
  //     event.preventDefault();
  //     //send chat
  //     //sendMessage();
  //   }
  // });

  //Socket
  socket.on('connect', function(){
    console.log('roomlist socket connect');
    $listParent.html("");
    socket.emit('query roomlist');
  });

  socket.on('load roomlist page', function(data){
    console.log('load roomlist page', data);
    showRoomList(data);
  });

  socket.on('redirect to room', function (data) {
    debugger;
		window.location.href = '/chats/' + data.id;
	});
});