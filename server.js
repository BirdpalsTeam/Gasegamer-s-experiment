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
var playerId;
PlayFab.settings.titleId = GAME_ID;
PlayFab.settings.developerSecretKey = 'KYBWN8AEATIQDEBHQTXUHS3Z5ZKWSF4P3JTY5HD9COQ1KCUHXN';

//Send the public files to the domain
app.use(express.static('public'))
app.get('/', function(req, res){
	res.sendFile('play.html');
  }); 

const gameState ={
	players: {}
}

//Websockets communication
io.on('connection', (socket) => {
	var PlayerInterval,waitToDisappear;

	console.log('A user connected: ' + socket.id);

	socket.on('disconnect', function(){
		console.log('A user disconnected: ' + socket.id);
		let Players = Object.values(gameState.players);
		Players.forEach(element => {
			if(element.socket == socket.id){
				delete gameState.players[element.id];
				
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
				console.log(result.data.UserInfo.TitleInfo);
				gameState.players[result.data.UserInfo.PlayFabId] ={
					id: result.data.UserInfo.PlayFabId,
					name: result.data.UserInfo.TitleInfo.DisplayName,
					socket: socket.id,
					x:410,
					y:380,
					width:62,
					height:72,
					isMoving: false,
					mouseX: 416,
					mouseY: 323,
					lastX: 410,
					lastY: 180,
					playerMove: function (move, player){ PlayerInterval = setInterval(move,1000 / 60, player)},	//Creates the player move function inside each player
					message: "",
					bubbleAppear: function(){ waitToDisappear = setTimeout(() => {
						let Players = Object.values(gameState.players);
						Players.forEach(element => {
							if(element.socket == socket.id){
								element.message = "";
								clearTimeout(waitToDisappear);
							}
						});
						
					},10000);//bubble appear end
					}
				}//gamestate end
			}else if (error != null){
				console.log(error);
			}
		})
		
	})

	socket.on('playerMovement', (playerMovement) =>{
		let Players = Object.values(gameState.players);
		Players.forEach(element => {
			if(element.socket == socket.id){
				const player = element;
		
		player.lastX = player.x;
		player.lastY = player.y;
			if(player.isMoving == false){
				player.playerMove(move, player);
				
			}else{
				clearInterval(PlayerInterval);
				player.playerMove(move, player);
			}
			}//if element end
		});//array end
		function move(player){								//Function responsible to move the player
			player.isMoving = true;
				let dx = playerMovement.mouseX - player.x;    //Get the difference x from the player position and the click position
				let dy = playerMovement.mouseY - player.y;

				let angle = Math.atan2(dy, dx);                //Calculates the angle from the difference between the player and the click
		
				var lenght= Math.sqrt(dx*dx + dy * dy);        //Calculates the distance bewtween the player and the click
			
				let speed = 4;
				velX = Math.cos(angle) * speed;                //Calculates the velocityX necessary to the player be at the same position as the click
				velY = Math.sin(angle) * speed;
			
				player.x += velX;                            //Moves the player
				player.y += velY;
				
				if(lenght){
				dx /= lenght;								//Normalize the dx and dy value
				dy/= lenght;
				}
				
				if(lenght >= 0.1 && lenght <= 2){			//Detects if the player reached the click position
					clearInterval(PlayerInterval);
					player.isMoving = false;
				}
				player.mouseX = playerMovement.mouseX;
				player.mouseY = playerMovement.mouseY;
				
		}	//Function end

    })//Player Movement end
	
	socket.on('message',(message)=>{
		let Players = Object.values(gameState.players);
		Players.forEach(element => {
			if(element.socket == socket.id){
				const player = element;
				if(message != undefined|| message != ""){
					isprofanity(message,function(t){
						if(t == true){
							console.log(message);
						}else{
							player.message = message;
							clearTimeout(waitToDisappear);
							player.bubbleAppear();
						}	
					},'data/profanity.csv','data/exceptions.csv',0.4);
				}else{
					message = "";
				}

			}//element end
		});//foreach end
	})//message end
}) // io connection end
	
setInterval(()=>{
	io.sockets.emit('state',gameState);				//Emit the gameState to all players online.
}, 1000/60);

//Starts the server on port 3000
http.listen(process.env.PORT || 3000, () => {
	console.log('listening on *:3000');
  });