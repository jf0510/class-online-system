$(function () {
  //initialize variables
  var $navParent = $('.navbar-nav');
  var $navLogIn;
  var $navLogOut;
  var $navCreateRoom;
  var $navRegist;
  var $navRoomList;
  var pathArray = window.location.pathname.split('/');
  var route = pathArray[1]; // localhost:3002/chats...
  var socket = io();

  $navCreateRoom = '<li class="nav-item"> <a class="nav-link" data-toggle="modal" data-target="#newChatroom"><i data-feather="plus" class="nav-icon"></i><span>新聊天室</span></a></li>';
  $navRoomList = '<li class="nav-item"> <a class="nav-link" href="/roomlist"><i data-feather="list" class="nav-icon"></i><span>聊天室列表</span></a> </li>';
  $navLogIn = '<li class="nav-item"> <a class="nav-link" data-toggle="modal" data-target="#login"><i data-feather="log-in" class="nav-icon"></i><span>登入</span></a></li>';
  $navLogOut = '<li class="nav-item"> <a class="nav-link" id="logout-submit"><i data-feather="log-out" class="nav-icon"></i><span>登出</span></a></li>';
  $navRegist = '<li class="nav-item"> <a href="#" data-toggle="modal" data-target="#signup" class="btn btn-outline-light" role="button" style="margin-top:.1rem">註冊</a></li>';

  function checkSession(){
    $navParent.html("");
    $.ajax({
      url: '/userSession',
      method: 'GET',
      dataType: 'JSON'
    })
    .done(function(data) {
      console.log(data, route);
      if(data.session){
        if(route && route !== "#"){
          // home page don't need create button
          $navParent.append($navCreateRoom);
        }
        if(route !== "roomlist"){
          // roomlist page don't need roomlist button
          $navParent.append($navRoomList);
        }
        $navParent.append($navLogOut);
        feather.replace();
      }else{
        console.log('not login yet');
        $navParent.append($navLogIn);
        $navParent.append($navRegist);
        feather.replace();
      }
    })
    .fail(function(){
      alert('check session failed, please try again.');
      $navParent.append($navLogIn);
      $navParent.append($navRegist);
      feather.replace();
      //$navLogIn;
    });
  }

  //Socket
  socket.on('connect', function(){
    console.log('socket connect');
    checkSession();
  });
});
