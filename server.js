var express = require('express');
var app = express();
var path = require('path');
const { setInterval } = require('timers');
const http = require('http').Server(app);
const io = require('socket.io')(http);
var isprofanity = require('isprofanity');
var PlayFab = require("./node_modules/playfab-sdk/Scripts/PlayFab/PlayFab");
var PlayFabClient = require("./node_modules/playfab-sdk/Scripts/PlayFab/PlayFabClient");
const { PlayFabServer } = require('playfab-sdk');
var GAME_ID = '238E6';
PlayFab.settings.titleId = GAME_ID;
PlayFab.settings.developerSecretKey = 'KYBWN8AEATIQDEBHQTXUHS3Z5ZKWSF4P3JTY5HD9COQ1KCUHXN';

//Send the public files to the domain
app.use(express.static('public'))
app.get('/', function(req, res){
	res.sendFile('play.html');
  }); 

var players = new Array();

//Websockets communication
io.on('connection', (socket) => {

	console.log('A user connected: ' + socket.id);

	socket.on('disconnect', function(){
		console.log('A user disconnected: ' + socket.id);
		players.forEach(player => {
			if(player.socket == socket.id){
				socket.broadcast.emit('byePlayer', player);
				players.splice(players.indexOf(player),1);
			}
			
		});
		
	})
	socket.on('createAccount', (create)=>{
		isprofanity(create.username,function(t){
			if(t == true){
				console.log('Player name is a bad word');
			}else{
				if(create.username != "" && create.password != ""|| create.username != " " && create.password != " "){
					var CustomTags = {verified:false};
					var registerRequest={
						TitleId: PlayFab.settings.titleId,
						Email: create.eMail,
						Username: create.username,
						Password: create.password,
						DisplayName: create.username,
						CustomId: "Player",
						CustomTags,
						CreateAccount: true
					}

					PlayFabClient.RegisterPlayFabUser(registerRequest, registerCallback);

					function registerCallback(error, result) {
						if (result !== null) {
							console.log("Someone created an account!");
						} else if (error !== null) {
							console.log("Something went wrong with your API call.");
							console.log("Here's some debug information:");
							console.log(error);
						}
					}
				}
			}
		},'data/profanity.csv','data/exceptions.csv',0.4);
		

	})
	socket.on('login',(ticket)=>{
		PlayFabServer.AuthenticateSessionTicket({SessionTicket: ticket},(error,result)=>{
			if(result != null){
				console.log(result.data.UserInfo);
				let thisPlayer = {
					id: result.data.UserInfo.PlayFabId,
					username: result.data.UserInfo.TitleInfo.DisplayName,
					socket: socket.id,
					x:410,
					y:380,
					width:62,
					height:72,
					isMoving: false,
					mouseX: 410,
					mouseY: 390,
					message: "",
					playerMove: function (move, thisPlayer){ movePlayerInterval = setInterval(move, 1000 / 60, thisPlayer)}	//Creates the player move function inside each player
				}//gamestate end
				players.push(thisPlayer);
				delete thisPlayer;
				io.sockets.emit('newPlayer',players);
				
			}else if (error != null){
				console.log(error);
			}
		})
		
	})

	socket.on('playerMovement', (playerMovement) =>{
		players.forEach(player =>{
			if(player.socket == socket.id){
				let movePlayerObject = {
					socket: socket.id,
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

			}
		})
		
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

			thisPlayer.x += velX;                            //Moves the player
			thisPlayer.y += velY;

			timeToPlayerReachDestination--;

			if(timeToPlayerReachDestination == 0){			//Detects if the player reached the click position
				clearInterval(movePlayerInterval);
			}
		}
		
    })//Player Movement end
	
	socket.on('message',(message)=>{
		players.forEach(player => {
			if(player.socket == socket.id){
				if(message != undefined || message != ""){
					isprofanity(message,function(t){
						if(t == true){
							let messageObject = {
								socket: socket.id,
								message: "🤬"
							}
							console.log('palavrao '+ message)
							socket.broadcast.emit('playerSaid', messageObject);
						}else{
							let messageObject = {
								socket: socket.id,
								message: message
							}
							console.log(message)
							socket.broadcast.emit('playerSaid', messageObject);
						}	
						
					},'data/profanity.csv','data/exceptions.csv',0.4);
				}

			}//element end
		});//foreach end
	})//message end
}) // io connection end

//Starts the server on port 3000
http.listen(process.env.PORT || 3000, () => {
	console.log('listening on *:3000');
  });