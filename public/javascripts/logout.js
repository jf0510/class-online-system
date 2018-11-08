$(function () {
  //initialize variables
  var $navParent = $('.navbar-nav');
  var $logoutButton = $('#logout-submit');
  //var socket = io();

  $navParent.on('click', '#logout-submit', function(){
    console.log("logout click");
    var username = "";//$loginUsername.val();
    var password = "";//$loginPassword.val();
    var info = {
      "username": username,
      "password": password
    }
    console.log(info);
    $.ajax({
      url: '/userLogout',
      method: 'POST',
      data: info,
      dataType: 'JSON'
    })
    .done(function() {
      window.location.href = '/';
      // socket.emit('add user', {
      //   username: name,
      //   roomId: roomId
      // });
    })
    .fail(function(){
      // $loginUsername.val('');
      // $loginUsername.focus();
      // $loginPassword.val('');
      alert('Login failed! Username or password may be wrong, please try again.');
    });
  });

  // $logoutButton.click(function () {
  //   console.log("logout click");
  //   var username = "";//$loginUsername.val();
  //   var password = "";//$loginPassword.val();
  //   var info = {
  //     "username": username,
  //     "password": password
  //   }
  //   console.log(info);
  //   $.ajax({
  //     url: '/userLogout',
  //     method: 'POST',
  //     data: info,
  //     dataType: 'JSON'
  //   })
  //   .done(function() {
  //     // window.location.href = '/';
  //     // socket.emit('add user', {
  //     //   username: name,
  //     //   roomId: roomId
  //     // });
  //   })
  //   .fail(function(){
  //     // $loginUsername.val('');
  //     // $loginUsername.focus();
  //     // $loginPassword.val('');
  //     alert('Login failed! Username or password may be wrong, please try again.');
  //   });
  // });
});
