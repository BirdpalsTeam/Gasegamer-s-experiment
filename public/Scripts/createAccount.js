document.getElementById('createAccount').addEventListener('click', create);
function create() {
	var eMail = document.getElementById('input-e');
	var username = document.getElementById('input-u');
	var password = document.getElementById('input-p'); // Feel free to add a function that the password input.value appear as ***** to the player
	var confirmedpassword = document.getElementById('input-cp'); //Gets the confirmed password
	
	var socket = io();
	if(username.value != "" && password.value!="" && eMail.value != ""){
			if(password.value == confirmedpassword.value){
					console.log(username.value);
					
					socket.emit('createAccount', {eMail: eMail.value,username: username.value, password: password.value});
			}
			else{
					alert("It appears the Password fields do not match."); //When the "Confirm Password" and "Password" fields do not contain the same text, display an error.
			}
	}
	else{
			alert("Please fill out the Email, Username and Password fields.") //When there isn't any text in the username & password fields, display error.
	}
	socket.on('accountCreated!', () =>{
		alert('Your account was created! Please check your email to verify your account.');
	})
	socket.on('dirtyWord', () =>{
		alert('Invalid Username. Please change it.')
	})
	socket.on('error', (error) =>{
		if(error.errorDetails != undefined){
			if(error.errorDetails.Email != undefined){
				alert(error.errorDetails.Email);
			}
			if(error.errorDetails.Username != undefined){
				alert(error.errorDetails.Username);
			}
			if(error.errorDetails.Password != undefined){
				alert(error.errorDetails.Password);
			}
		
		}
	})
}
$(document).ready(function() {

	$('.submit_on_enter').keydown(function(event) {
	  // enter has keyCode = 13, change it if you want to use another button
	  if (event.keyCode == 13) {
		create();
		return false;
	  }
	});
  
  });