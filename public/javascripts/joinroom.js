$(function () {
  //initialize variables
  var $pincodeSubmitButton = $('#pincode-submit');
  var $pincodeInput = $('#pincode');
  var socket = io();
  $pincodeSubmitButton.click(function(){
    console.log($pincodeInput.val());
    debugger;
    if ($pincodeInput.val() != ""){
      window.location.href = '/chats/' + $pincodeInput.val();
    }
  });

  //Keyboard events
  $(window).keydown(function(event){
    if (!event.shiftKey && event.which === 13 && typeof $pincodeInput.val() != "undefined" && $pincodeInput.val() !== "") {  //'ENTER'
      debugger;
      window.location.href = '/chats/'+ $pincodeInput.val();
    }
  });
});
