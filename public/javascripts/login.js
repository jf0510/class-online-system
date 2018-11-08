$(function () {
  //initialize variables
  var $navParent = $('.navbar-nav');
  var $loginUsername = $('#username');
  var $loginPassword = $('#password');
  var $loginButton = $('#login-submit');
  //var socket = io();

  $loginButton.click(function () {
  //$navParent.on('click', '#login-submit', function(){
    console.log("login click detect");
    var username = $loginUsername.val();
    var password = $loginPassword.val();
    var info = {
      "username": username,
      "password": password
    }
    console.log(info);
    $.ajax({
      url: '/userLogin',
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
      console.log('Login failed! Username or password may be wrong, please try again.');
    });
  });
});
