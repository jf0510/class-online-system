$(function () {
  //initialize variables
  var $chatTitle = $('#chat-title');
  var $memberList = $('#member-list');
  // var $chatHistory = $('#chat-message');
  var $sendButton = $('#send-button');
  var $messageInput = $('#message-input');
  var $messages = $('.messages');
  var $myProfile = $('#my-profile');
  var $myName = $('#my-name')
  var $sendButton;
  var socket = io();
  var username;
  var roomtype;
  var mode = "newest"; //newest, hottest
  var $newestButton = $('#newest');
  var $hottestButton = $('#hottest');
  var chatHistory = [];

  /* FOR PRIVATE CHATS */
  var pathArray = window.location.pathname.split('/');
  var base = pathArray[1];
  var id = pathArray[2];
  /*

  /*DISABLE CHAT*/
  var $myOnOffSwitch = $('#myonoffswitch');
  var available = true;//remember now status for front end
  /**/
  // $loginButton.click(function () {
  //   var username = $loginUsername.val();
  //   var password = $loginPassword.val();
  //   var info = {
  //     "username": username,
  //     "password": password
  //   }
  //   console.log(info);
  //   socket.emit('login', info);
  // });

  // $registerButton.click(function () {
  //   if (checking()) {
  //     var email = $registerEmail.val();
  //     var username = $registerUsername.val();
  //     var password = $registerPasword.val();
  //     var info = {
  //       "email": email,
  //       "username": username,
  //       "password": password
  //     }
  //     console.log(info);
  //     socket.emit('register', info);
  //   }
  // });

  // $registerConfirmPasword.on('input', function () {
  //   //checking();
  //   console.log("typing");
  // });*/

  $(document).ready(function(){
    console.log($('#myonoffswitch'));
    console.log($('.enable-toggle'));
    $('#myonoffswitch').on('change', function(){
      if($(this).is(':checked')){
        //if true means open
        socket.emit('change room status', true);
        
        frontendONOFF(true);
      }
      else{
        socket.emit('change room status', false);
        
        frontendONOFF(true);
      }
    });
  });
  /*check available*/
  function checkstatus(){
    var status = socket.emit('get room status');
    console.log(status);
    return status;
  }
  /*turn on/off the input field*/
  function frontendONOFF(status){
      $messageInput.attr('disabled', !status);
      if(status){
        $messageInput.attr('placeholder', 'Write Your message...');
      }else{
        $messageInput.attr('placeholder', 'shhhh...');
      }
      console.log($messageInput);
  }

  function sendMessage() {
    message = $messageInput.val().trim();
    console.log(message);
    if (message) {
      $messageInput.val('');
      // if(roomtype == 'tradition'){
      //   createChatMessage(message, username);
      // }else{
      //   createVoteMessage(message, username, 0);
      // }
      socket.emit('new message', message);
    }
  }

  function createChatMessage(message, user) {
    var type = '';
    var align = '';
    console.log(user, username);
    if (user === username) {
      type = 'replies';
      align = 'text-right';
      order = '<b></b> <span>3:25 PM</span> <div class="user-avatar"><img avatar="' + user + '"></div></div>';
    } else {
      type = 'sent';
      order = '<div class="user-avatar"><img avatar="' + user + '"></div><b></b> <span>3:25 PM</span> </div>';
    }

    var $li = $(
      '<li class="' + type + '">' + 
      '<div class="message-header ' + align + '">' +
      order + '<p></p>' +
      '</li>'
    );

    $li.find('p').text(message);
    $li.find('b').text(user);
    $li.find('span').text("");
    LetterAvatar.transform1($li.find('img')[0]);
    //postMessage($li);
    $messages.append($li);
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  function createVoteMessage(msgid, message, user, score, userlist) {
    var $heartStatus = "far";
    //console.log(userlist,username);
    if(userlist.includes(username)){
      $heartStatus = "fas";
    }
    var $tr = $(
      '<tr class="slideInLeft animated"><td><button type="button" class="vote-button">' + 
      '<i class="' + $heartStatus + ' fa-heart"></i></button><div class="voteNum" id="voteNum-' + msgid + '">' + score + '</div></td>' +
      '<td><div class="user-avatar"><img avatar="' + user + '"></div><div class="message-sender"><b></b>' +
      '<span>3:25 PM</span></div><p></p></td></tr>'
    );

    $tr.find('p').text(message);
    $tr.find('b').text(user);
    $tr.find('span').text("");
    LetterAvatar.transform1($tr.find('img')[0]);
    //postMessage($tr);
    if(mode === "newest"){
      $messages.prepend($tr);
    }else{
      $messages.append($tr);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  function chatHistorySort(){
    if(mode == "newest"){
      chatHistory.sort(function(a, b){
        return a.time > b.time? 1:-1; //Time early to now
      });
    }else{
      chatHistory.sort(function(a, b){
        return a.score < b.score? 1:-1; //Score big to small
      });
    }
  }

  // function userColor(user, forText) {
  //   var hash = 2;
  //   for (var i = 0; i < user.length; i++) {
  //     hash = user.charCodeAt(i) + (hash<<2);
  //   }
  //   var index = hash % COLORS.length;
  //   if (forText)
  //     return COLORS_TEXT[index];
  //   return COLORS[index];
  // }

  // function postMessage(el) {
  //   var $el = $(el);
  //   $messages.append($el);
  //   $messages[0].scrollTop = $messages[0].scrollHeight;
  // }
  
  function showUserList(list){
    for (var i = 0 ; i < list.length; i++) {
      addUser(list[i]);
      // var $listElement = $("<li><img avatar='"+name+"'><span>"+name+"</span> </li>");
      // $('#member-list').append($listElement);
      // LetterAvatar.transform1($listElement.find('img')[0]);
    }
  }

  function addUser(name){
      var $listElement = $("<li id='" + name + "'><img avatar='" + name + "'><span>"+name+"</span> </li>");
      $memberList.append($listElement);
      LetterAvatar.transform1($listElement.find('img')[0]);
  }

  function removeUser(name){
    console.log("remove trigger");
    $('#' + name).remove();
  }

  function setUsername(name) {
    username = name;
  }

  function isAdmin(name){
    $.get('/roomAdmin/' + id, function(data){
      //alert(data.isAdmin);
      return data.isAdmin;
    });
    // $.ajax({
    //   url: '/roomAdmin/' + id,
    //   method: 'GET',
    //   dataType: 'JSON'
    // }).done(function(data) {
    //   console.log(data.isAdmin);
    //   return data.isAdmin;
    // }).fail(function(){
    //   alert("something wrong");
    // });
  }

  function checkIsMeself(name){
    if(name == username){
      return true;
    }else{
      return false;
    }
  }

  function setRoomtype(type) {
    roomtype = type;
  }

  function checkScoreSort(e, score) {
    var e2 = e;
    console.log(score, e2.prev().find('*[id*="voteNum-"]').text());
    console.log(score, e2.next().find('*[id*="voteNum-"]').text());
    if(score > e2.prev().find('*[id*="voteNum-"]').text()){
      while(e2.prev().length && score > e2.prev().find('*[id*="voteNum-"]').text()){
        e2 = e2.prev();
        console.log(e2, e2.prev().length);
      }
      e.insertBefore(e2);
      //chatHistorySort();
    }else if(score < e2.next().find('*[id*="voteNum-"]').text()){//} chatHistory[data.msgid+1].score){
      //var e = $('#voteNum-' + data.msgid).parent().parent();
      while(e2.next().length && score < e2.next().find('*[id*="voteNum-"]').text()){
        e2 = e2.next();
        console.log(e2, e2.next().length);
      }
      e.insertAfter(e2);
      //chatHistorySort();
    }
  }

  //Keyboard events
  $(window).keydown(function(event){
    if (!event.shiftKey && event.which === 13 && $messageInput.is(":focus")) {  //'ENTER'
      event.preventDefault();
      //send chat
      sendMessage();
    }
  });

  //Send message click
  $sendButton.click(function () {
    sendMessage();
  });

  //Heart click
  $messages.on('click', '.fa-heart', function(){
    console.log(username,'heart clicked');
    // $(this).removeClass('bounceIn animated');
    // $target = $(this);
    // setTimeout("$target.addClass('bounceIn animated');",100);
    $(this).toggleClass('fas');
    $(this).toggleClass('far');
    var id = $(this).parent().parent().find('.voteNum').attr("id");
    console.log(id);
    var msgid = id.split("-")[1];
    console.log(msgid);
    console.log(chatHistory[msgid].userlist);
    if(chatHistory[msgid].userlist.includes(username)){
      socket.emit('minus voting', {
        username: username,
        msgId: msgid
      });
    }else{
      socket.emit('add voting', {
        username: username,
        msgId: msgid
      });
    }
  });

  //Sort click
  $hottestButton.click(function(){
    if(mode !== "hottest"){
      mode = "hottest";
      chatHistorySort();
      $messages.html("");
      for(var i=0; i<chatHistory.length; i++){
        createVoteMessage(chatHistory[i].msgid, chatHistory[i].message, chatHistory[i].username, chatHistory[i].score, chatHistory[i].userlist);
      }
    }
  });

  $newestButton.click(function(){
    if(mode !== "newest"){
      mode = "newest";
      chatHistorySort();
      $messages.html("");
      for(var i=0; i<chatHistory.length; i++){
        createVoteMessage(chatHistory[i].msgid, chatHistory[i].message, chatHistory[i].username, chatHistory[i].score, chatHistory[i].userlist);
      }
    }
  });

  //Switch On off
  $('.onoffswitch-inner').on('click', function()  {
      //$(this).toggleClass('On').toggleClass('Off');
      console.log("clicked");
  });

  //Socket
  socket.on('connect', function(){
    console.log('socket connect');
    if (base === 'chats' && id) {
      if (id.length === 6) {
        roomId = id;
        console.log(id);
        $messages.empty();
        $memberList.empty();
        $messageInput.focus();
        socket.emit('load', roomId);
      }
    }else if (base === 'chats' && !id){
      //go to lobby?
    }
  });

  socket.on('load chat page', function(data){
    console.log('load chat page', data);
    // console.log(data.roomId);
    // console.log(data.roomName);
    // console.log(data.userName);
    // console.log(data.members);
    // console.log(data.type);
    // console.log(data.isAdmin);
    showUserList(data.members);
    setUsername(data.userName);
    setRoomtype(data.type);
    if(!data.isAdmin){
      $('div.onoffswitch').remove();
    }
    //$toggle = '<div class="onoffswitch mx-auto"><input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="myonoffswitch" checked><label class="onoffswitch-label" for="myonoffswitch"> <span class="onoffswitch-inner"></span> <span class="onoffswitch-switch"></span> </label></div>';
    //$myProfile.html('<img avatar="' + data.userName + '"><p>' + data.userName + '</p>' + $toggle);
    $myProfile.find('img').attr('avatar', data.userName);
    $myName.text(data.userName);
    LetterAvatar.transform1($myProfile.children()[0]);
    $chatTitle.html('<span class="badge-info badge-pill pincode-title" id="pincode-no">' + data.roomId + '</span>' + data.roomName);
  });

  socket.on('page does not exist', function () {
    alert("房間不存在!");
    window.location.href = '/';
  });

  // socket.on('create virtual user', function (data) {
  //   alert(data);
  //   $loginUsername.val("");
  //   $loginPassword.val("");
  // });

  socket.on('new message', function(data){
    //console.log(data.type);
    if(data.type === "tradition"){
      createChatMessage(data.message, data.username);
    }else{
      createVoteMessage(data.msgid, data.message, data.username, data.score, data.userlist);
      var msgObject = {msgid: data.msgid, username: data.username, message: data.message, score: data.score, userlist: data.userlist, time: data.time};
      chatHistory.push(msgObject);
    }
  });

  socket.on('score change', function(data){
    console.log('score change', data);
    $('#voteNum-' + data.msgid).text(data.score);
    if(checkIsMeself(data.username)){
      $target = $('#voteNum-' + data.msgid).parent().find('i');
      $target.removeClass('bounceIn animated');
      setTimeout("$target.addClass('bounceIn animated');",100);
    }else{
      $target = $('#voteNum-' + data.msgid);
      $target.removeClass('bounceIn animated');
      setTimeout("$target.addClass('bounceIn animated');",100);
    }
    chatHistory[data.msgid].score = data.score;
    chatHistory[data.msgid].userlist = data.userlist;
    if(mode == "hottest"){
      //console.log(chatHistory);
      var e = $('#voteNum-' + data.msgid).parent().parent();
      checkScoreSort(e, chatHistory[data.msgid].score);
    }
  });

  socket.on('user joined', function(data){
    console.log("joined",data);
    addUser(data.username);
  });

  socket.on('user left', function(data){
    console.log("left",data);
    removeUser(data.username);
    //TODO: also remove user's vote
  });
  socket.on('change room status', function(status){
    console.log('in socket: '+status);
    frontendONOFF(status);
    if(status){
      alert('快點high起來！');
    }else{
      alert('現在是寂靜模式！');
    }
  });
  socket.on('maximum', function(){
    alert('喔糟了！這房間裡擠滿了人！');
    window.location.href = '/';
  });
});