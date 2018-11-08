$(function () {
  //initialize variables
  var $registerEmail = $('#register-email');
  var $registerUsername = $('#register-username');
  var $registerPasword = $('#register-password');
  var $registerConfirmPasword = $('#register-confirm-password');
  var $registerButton = $('#register-submit');
  $('#register-form').submit(function(e){
    e.preventDefault();
    $.ajax({
        url:'/userRegister',
        type:'post',
        data:$('#register-form').serialize(),
        success:function(data){
          if(data.type == 'error'){
            alert(data.msg)
            //whatever you wanna do after the form is successfully submitted
          }else{
            window.location.href = '/';    
          }
        },
        fail:function(data){
          alert(data.error);
        }
    });
  });

    
  //var socket = io();

  /*$registerButton.click(function () {
    if (checking()) {
      var email = $registerEmail.val();
      var username = $registerUsername.val();
      var password = $registerPasword.val();
      var info = {
        "email": email,
        "username": username,
        "password": password
      }
      console.log(info);
      //socket.emit('register', info);
      $.ajax({
        url: '/userRegister',
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
        $registerEmail.val('');
        $registerEmail.focus();
        $registerUsername.val('');
        $registerPasword.val('');
        $registerConfirmPasword.val('');
        alert('Register failed! Username or email have register before.');
      });
    }
  });*/

  $registerConfirmPasword.on('input', function () {
    //checking();
    console.log("typing");
  });

  function checking() {
    if ($registerConfirmPasword.val() != "" && $registerConfirmPasword.val() != $registerPasword.val()) {
      //$registerConfirmPasword.addClass("form-control-danger");
      alert("please input same password twice");
      return false;
    } else {
      return true;
    }
  }
});
