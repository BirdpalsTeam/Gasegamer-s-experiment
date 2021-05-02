var express = require('express');
var app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');
var isprofanity = require('isprofanity');
var server_utils = require('./serverData/server-utils');
var PlayFab = require("./node_modules/playfab-sdk/Scripts/PlayFab/PlayFab");
var PlayFabClient = require("./node_modules/playfab-sdk/Scripts/PlayFab/PlayFabClient");
const { PlayFabServer, PlayFabAdmin } = require('playfab-sdk');
var GAME_ID = '238E6';
PlayFab.settings.titleId = GAME_ID;
PlayFab.settings.developerSecretKey = 'KYBWN8AEATIQDEBHQTXUHS3Z5ZKWSF4P3JTY5HD9COQ1KCUHXN';

//Send the public files to the domain
app.use(express.static('public'));

app.get('/', function(req, res){
	res.sendFile('play.html');
}); 

const RECAPTCHA_SECRET = "6LePMZsaAAAAAKKj7gHyWp8Qbppk5BJOcqvEYD9I";

var players = new Array();
var devTeamJson = fs.readFileSync('./serverData/devTeam.json');
var devTeam = JSON.parse(devTeamJson);

var roomCollMapX = 8;
var roomCollMapY = 17;
var roomCollCellWidth = 800 / roomCollMapX;
var roomCollCellHeight = 500 / roomCollMapY;
var roomCollMap = [
	0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 1, 1, 1, 1, 0, 0,
	1, 1, 1, 0, 0, 1, 1, 1,
	1, 0, 0, 0, 0, 0, 0, 1,
	1, 0, 0, 0, 0, 0, 0, 1,
	1, 0, 0, 0, 0, 0, 0, 1,
	1, 0, 0, 0, 0, 0, 0, 1,
	1, 1, 0, 0, 0, 0, 1, 1,
	0, 1, 0, 0, 0, 0, 1, 0,
	0, 1, 1, 1, 1, 1, 1, 0
];

//Websockets communication
io.on('connection', (socket) => {

	console.log('A user connected: ' + socket.id);

	socket.on('disconnect', function(){
		console.log('A user disconnected: ' + socket.id);
		if(players.length > 0){
			let disconnectedPlayer = server_utils.getElementFromArrayByValue(socket.playerId, 'id', players);
			if(disconnectedPlayer == false) return;
			socket.broadcast.emit('byePlayer', disconnectedPlayer);
			server_utils.removeElementFromArray(disconnectedPlayer, players);
		}
	})
	socket.on('createAccount', (create)=>{
		isprofanity(create.username,function(t){
			if(t == true){
				console.log('Player name is a bad word');
				socket.emit('dirtyWord');
			}else{
				if(create.username != "" && create.password != ""|| create.username != " " && create.password != " "){
					var registerRequest={
						TitleId: PlayFab.settings.titleId,
						Email: create.eMail,
						Username: create.username,
						Password: create.password,
						DisplayName: create.username,
						CustomId: "Player",
						CreateAccount: true
					}

					PlayFabClient.RegisterPlayFabUser(registerRequest, registerCallback);
					let addContactEmailRequest = {
						EmailAddress: create.eMail
					}
					
					function registerCallback(error, result) {
						if (result !== null) {
							console.log("Someone created an account!");
							PlayFabClient.AddOrUpdateContactEmail(addContactEmailRequest, (error, result) => {
								if(result !== null){
									console.log('Contact email added!');
									socket.emit('accountCreated!');
								}else if (error !== null){
									console.log('Something went wrong... ' + error);
								}
							})
							
						} else if (error !== null) {
							console.log("Something went wrong with your API call.");
							console.log("Here's some debug information:");
							console.log(error);
							socket.emit('error', error);
						}
					}
				}
			}
		},'data/profanity.csv','data/exceptions.csv',0.4);
		

	})
	socket.on('login',(ticket)=>{
		PlayFabServer.AuthenticateSessionTicket({SessionTicket: ticket},(error,result)=>{
			if(result != null){
				let resultFromAuthentication = result;
				let PlayFabId = resultFromAuthentication.data.UserInfo.PlayFabId;
				let PlayerProfileViewConstraints = {
					ShowContactEmailAddresses: true
				}
				let playerProfileRequest = {
					PlayFabId: result.data.UserInfo.PlayFabId,
					ProfileConstraints: PlayerProfileViewConstraints
				}
				if(resultFromAuthentication.data.UserInfo.TitleInfo.isBanned == true){
					socket.emit('youAreBanned'); 
					return;
				}
				PlayFabServer.GetPlayerProfile(playerProfileRequest, (error,result)=>{
					if(result !== null && result.data.PlayerProfile.ContactEmailAddresses[0] != undefined){
							if(result.data.PlayerProfile.ContactEmailAddresses[0].VerificationStatus == "Confirmed"){
								if(players.length > 0){	//Check if there is at least one player online
									let logged;
									let playerAlreadyLogged = server_utils.getElementFromArrayByValue(PlayFabId, 'playerId', io.sockets.sockets);
									//Check if the player is already logged in
									if(playerAlreadyLogged.playerId == PlayFabId){
										socket.emit('alreadyLoggedIn');
										playerAlreadyLogged.emit('loggedOut');
										playerAlreadyLogged.disconnect(true);
										logged = true;
									}

									logged == true ? logged = false : createPlayer();	//If the player is not logged in create player
									
								}else{	//If not create this first player
									createPlayer();
								}
						
								function createPlayer(){
									let thisPlayer = {
										id: PlayFabId,
										username: resultFromAuthentication.data.UserInfo.TitleInfo.DisplayName,
										x:410,
										y:380,
										width:62,
										height:72,
										isMoving: false,
										mouseX: 410,
										mouseY: 390,
										message: "",
										isDev: false,
										playerMove: function (move, thisPlayer){ movePlayerInterval = setInterval(move, 1000 / 60, thisPlayer)}	//Creates the player move function inside each player
									}
									if(server_utils.getElementFromArrayByValue(PlayFabId, 'id', devTeam.devs) != false){
										thisPlayer.isDev = true;
									};
									players.push(thisPlayer);
									socket.playerId = resultFromAuthentication.data.UserInfo.PlayFabId;
									socket.emit('readyToPlay?');	//Say to the client he/she can already start playing
									socket.broadcast.emit('newPlayer', thisPlayer); //Emit this player to all clients logged in
								}

						}else if (result.data.PlayerProfile.ContactEmailAddresses[0].VerificationStatus == "Unverified" || result.data.PlayerProfile.ContactEmailAddresses[0].VerificationStatus == "Pending"){
							let SendEmailFromTemplateRequest ={
								EmailTemplateId: '97A33843288F67E',
								PlayFabId: result.data.PlayerProfile.PlayerId
							}
							
							PlayFabServer.SendEmailFromTemplate(SendEmailFromTemplateRequest, (error, result) => {
								if(result !== null){
									console.log(result);
								}else if(error !== null){
									console.log(error);
								}
							})

							socket.emit('verificationStatus');
						}
						
					}
					else if(error !== null){
						console.log(error)
					}
				})

				
			}else if (error != null){
				console.log(error);
				socket.emit('loginError');
			}
		})

	})
	socket.on('Im Ready', () =>{
		if(socket.playerId == undefined) return;
		socket.emit('loggedIn', (players));
	})
	socket.on('playerMovement', (playerMovement) =>{
		if(socket.playerId == undefined) return;
		let player = server_utils.getElementFromArrayByValue(socket.playerId, 'id', players);
		let movePlayerObject = {
			socket: socket.id,
			id: player.id,
			mouseX: playerMovement.mouseX, 
			mouseY: playerMovement.mouseY
		}
		
		socket.broadcast.emit('playerIsMoving', movePlayerObject);
	
		if(player.isMoving == false){
			player.playerMove(movePlayerFunction, player);
		}else{
			clearInterval(movePlayerInterval);
			player.isMoving = false;
			player.playerMove(movePlayerFunction, player);
		}

		function movePlayerFunction(thisPlayer){
			thisPlayer.isMoving = true;
			thisPlayer.mouseX = playerMovement.mouseX;
			thisPlayer.mouseY = playerMovement.mouseY;
			let dx = playerMovement.mouseX - thisPlayer.x;    //Get the difference x from the player position and the click position
			let dy = playerMovement.mouseY - thisPlayer.y;

			let angle = Math.atan2(dy, dx);                //Calculates the angle from the difference between the player and the click
			
			let speed = 4;

			velX = Math.cos(angle) * speed;                //Calculates the velocityX necessary to the player be at the same position as the click
			velY = Math.sin(angle) * speed;
		
			let timeToPlayerReachDestination = Math.floor(dx/velX); //it doesn't matter if you use dy and velY or dx and velX
			let x,y;
			for(y = 0; y < roomCollMapY; y++){
				for(x = 0; x < roomCollMapX; x++){
					if(roomCollMap[y*roomCollMapX+x] == 1) {
						if(thisPlayer.x + velX <= roomCollCellWidth * x + roomCollCellWidth && thisPlayer.x + velX >= roomCollCellWidth * x){
							if(thisPlayer.y + velY <= roomCollCellHeight * y + roomCollCellHeight && thisPlayer.y + velY >= roomCollCellHeight * y){
								thisPlayer.isMoving = false;
								clearInterval(movePlayerInterval);
								return;
							}
						}
					}
				}
			}
			thisPlayer.x += velX;                            //Moves the player
			thisPlayer.y += velY;

			timeToPlayerReachDestination--;

			if(timeToPlayerReachDestination == 0){			//Detects if the player reached the click position
				clearInterval(movePlayerInterval);
			}
		}
		
    })//Player Movement end
	
	socket.on('message',(message)=>{
		if(socket.playerId == undefined) return;
		let player = server_utils.getElementFromArrayByValue(socket.playerId, 'id', players);
		if(message != undefined && message != "" && message.includes('/ban') == false && message.includes('/unban') == false){
			isprofanity(message, function(t){
				if(t == true){
					let messageObject = {
						socket: socket.id,
						message: "🤬"
					}
					console.log(player.username +' said the following bad word: '+ message);
					socket.broadcast.emit('playerSaid', messageObject);
				}else{
					let messageObject = {
						id: player.id,
						message: message
					}
					console.log(player.username + ' said: ' + message);
					socket.broadcast.emit('playerSaid', messageObject);
				}	
				
			},'data/profanity.csv','data/exceptions.csv',0.4);
		}
	})

	socket.on('/ban', (message) =>{
		if(socket.playerId == undefined) return;
		let player = server_utils.getElementFromArrayByValue(socket.playerId, 'id', players);
		if(player.isDev == true){	//Template of the message should be /ban timeOfBan banPlayerName reason
			message = message.split(" ");
			let timeOfBan = message[1];
			let banPlayerName = message[2];
			let reason = message.slice(3,message.length);
			reason = reason.toString().split(',').join(' '); //Returns the reason with spaces
			
			if(isNaN(timeOfBan) == true || banPlayerName == undefined || reason == undefined) return; //Check if the message is in correct form
			
			let banRequest;
			
			PlayFabAdmin.GetUserAccountInfo({Username: banPlayerName}, (error, result) =>{
				if(result !== null){
					let playerInPlayfab = result.data.UserInfo.PlayFabId;
					if(server_utils.getElementFromArrayByValue(playerInPlayfab, 'id', devTeam.devs) == false){

						if(timeOfBan === '9999'){
							banRequest = {
								Bans: [{PlayFabId: playerInPlayfab, Reason: reason}]
							}
						}else{
							banRequest = {
								Bans: [{DurationInHours: timeOfBan, PlayFabId: playerInPlayfab, Reason: reason}]
							}
						}
						PlayFabServer.BanUsers(banRequest, (error, result) =>{	//Ban request to playfab
							if(result !== null){
								console.log(result);
								let removeBannedPlayerSocket = server_utils.getElementFromArrayByValue(playerInPlayfab, 'playerId', io.sockets.sockets);
								socket.emit('playerBanned!');
								if(removeBannedPlayerSocket == false) return;
								removeBannedPlayerSocket.disconnect(true);
							}else if(error !== null){
								console.log(error)
							}
						})
					}
					console.log(result);
				}else if(error !== null){
					console.log(error);
				}
			})
		}
	});

	socket.on('/unban', (message) =>{
		if(socket.playerId == undefined) return;
		let player = server_utils.getElementFromArrayByValue(socket.playerId, 'id', players);
		if(player.isDev == true){	//Template of the message should be /unban banPlayerName
			message = message.split(" ");
			let banPlayerName = message[1];
			if(banPlayerName == undefined) return; //Check if the message is in the correct form.
			let resultFromGetAccount;
			PlayFabAdmin.GetUserAccountInfo({Username: banPlayerName}, (error, result) =>{	//Get user PlayFabId by username
				if(result !== null){
					resultFromGetAccount = result;
					let unBanRequest = {
						PlayFabId: resultFromGetAccount.data.UserInfo.PlayFabId
					}
					PlayFabServer.RevokeAllBansForUser(unBanRequest, (error, result) =>{	//Revoke All Bans from user
						if(result !== null){
							console.log(result);
							socket.emit('playerUnbanned!');
						}else if(error !== null){
							console.log(error);
						}
					});
				}else if(error !== null){
					console.log(error);
				}
			})
			
		}
	})

	socket.on('/remove', (message) =>{
		if(socket.playerId == undefined) return;
		let player = server_utils.getElementFromArrayByValue(socket.playerId, 'id', players);
		if(player.isDev == true){
			message = message.split(" ");
			let removePlayerObject = server_utils.getElementFromArrayByValue(message[1], 'username', players);
			if(removePlayerObject == false) return;
			let removePlayerSocket = server_utils.getElementFromArrayByValue(removePlayerObject.id, 'playerId', io.sockets.sockets);
			if(removePlayerSocket == false) return;
			removePlayerSocket.disconnect(true);
		}
	})
}) // io connection end

//Starts the server on port 3000
http.listen(process.env.PORT || 3000, () => {
	console.log('listening on *:3000');
});