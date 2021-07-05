//Server
var express = require('express');
var app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
//isProfanity and etc
const fs = require('fs');
var isprofanity = require('isprofanity');
var server_utils = require('./serverData/server-utils');
const AFKTime = 300000; //5 minutes
//Playfab
var PlayFab = require("./node_modules/playfab-sdk/Scripts/PlayFab/PlayFab");
var PlayFabClient = require("./node_modules/playfab-sdk/Scripts/PlayFab/PlayFabClient");
const { PlayFabServer, PlayFabAdmin } = require('playfab-sdk');
var GAME_ID = '238E6';
PlayFab.settings.titleId = GAME_ID;
PlayFab.settings.developerSecretKey = 'KYBWN8AEATIQDEBHQTXUHS3Z5ZKWSF4P3JTY5HD9COQ1KCUHXN';
//Discord Bot
const Discord = require('discord.js');
const client = new Discord.Client();
function embedText(who, message){
	return new Discord.MessageEmbed().addField(who, message);
}
let prefix = '!';
//Send the public files to the domain
app.use(express.static('public'));

app.get('/', function(req, res){
	res.sendFile('play.html');
}); 
PlayFabAdmin.UpdatePolicy
const RECAPTCHA_SECRET = "6LePMZsaAAAAAKKj7gHyWp8Qbppk5BJOcqvEYD9I";

var roomsJson = fs.readFileSync('./serverData/roomsJSON.json');
var rooms = JSON.parse(roomsJson);

var players = new Array();

class Player{
	constructor(id, username, x, y, width, height, isMoving, mouseX, mouseY, message, isDev, items=[]){
		this.id = id;
		this.username = username;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.isMoving = isMoving;
		this.mouseX = mouseX;
		this.mouseY = mouseY;
		this.message = message;
		this.movePlayerInterval;
		this.isDev = isDev;
		this.items = items;
	}
	move(room){
		this.isMoving = true;
		let dx = this.mouseX - this.x;
		let dy = this.mouseY - this.y;
		
		let angleToMove = Math.atan2(dy,dx);

		let speed = 4;

		let velX = Math.cos(angleToMove) * speed;
		let velY = Math.sin(angleToMove) * speed;
		let timeToPlayerReachDestination = Math.floor(dx/velX);

		let roomCollMapX = room.roomCollMapX;
		let roomCollMapY = room.roomCollMapY;
		let roomCollCellWidth = 800 / roomCollMapX;
		let roomCollCellHeight = 500 / roomCollMapY;
		let collisionArray = room.collision;
		let collided;

		this.movePlayerInterval = setInterval(() => {
			for(let i = 0; i < collisionArray.length; i+=2){
				if(timeToPlayerReachDestination <= 0) return collided = true;
				
				if(this.x + velX <= collisionArray[i] + roomCollCellWidth && this.x + velX >= collisionArray[i]){
					if(this.y + velY <= collisionArray[i + 1] + roomCollCellHeight && this.y + velY >= collisionArray[i + 1]){
						this.isMoving = false;
						clearInterval(this.movePlayerInterval);
						return collided = true;
					}
				}
			}
			this.x += velX;
			this.y += velY;

			timeToPlayerReachDestination--;
			if(timeToPlayerReachDestination <= 0){
				this.isMoving = false;
				clearInterval(this.movePlayerInterval);
			}
		}, 1000 / 60);	
	}
}

var devTeamJson = fs.readFileSync('./serverData/devTeam.json');
var devTeam = JSON.parse(devTeamJson);

//Websockets communication
io.on('connection', (socket) => {

	console.log('A user connected: ' + socket.id);
	
	socket.on('disconnect', function(){
		console.log('A user disconnected: ' + socket.id);
		if(players.length > 0){
			let disconnectedPlayer = server_utils.getElementFromArrayByValue(socket.playerId, 'id', players);
			let thisPlayerRoom = server_utils.getElementFromArrayByValue(socket.gameRoom, 'name', Object.values(rooms));
			if(disconnectedPlayer == false || thisPlayerRoom.players == false) return;
			socket.broadcast.to(socket.gameRoom).emit('byePlayer', disconnectedPlayer);
			server_utils.removeElementFromArray(disconnectedPlayer, players);
			server_utils.removeElementFromArray(disconnectedPlayer, thisPlayerRoom.players);
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
				if(resultFromAuthentication.data.UserInfo.TitleInfo.isBanned == true){ //Check if the player is banned
					socket.emit('youAreBanned'); 
					return;
				}
				PlayFabServer.GetPlayerProfile(playerProfileRequest, (error,result)=>{ //Get player profile
					if(result !== null && result.data.PlayerProfile.ContactEmailAddresses[0] != undefined){
							if(result.data.PlayerProfile.ContactEmailAddresses[0].VerificationStatus == "Confirmed"){ //Player is verified
								PlayFabAdmin.GetUserInventory({PlayFabId: PlayFabId}, (error, result) =>{ //Get player inventory
									if(result !== null){
										if(players.length > 0){	//Check if there is at least one player online
											let logged, preventRecursion;
											preventRecursion = io.sockets.sockets;
											let playerAlreadyLogged = server_utils.getElementFromArrayByValue(PlayFabId, 'playerId', preventRecursion);
											//Check if the player is already logged in
											if(playerAlreadyLogged != false){
												socket.emit('alreadyLoggedIn');
												let thisPlayerRoom = server_utils.getElementFromArrayByValue(playerAlreadyLogged.gameRoom, 'name', Object.values(rooms));
												let preventRecursion2 = thisPlayerRoom.players;
												let thisPlayer = server_utils.getElementFromArrayByValue(playerAlreadyLogged.playerId, 'id', preventRecursion2);
												if(thisPlayer.isMoving == true){
													clearInterval(thisPlayer.movePlayerInterval);
													thisPlayer.isMoving == false;
												}
												playerAlreadyLogged.emit('loggedOut');
												playerAlreadyLogged.disconnect(true);
												logged = true;
											}
		
											logged == true ? logged = false : createPlayer(PlayFabId, result.data.Inventory);	//If the player is not logged in create player
											
										}else{	//If not create this first player
											createPlayer(PlayFabId,result.data.Inventory);
										}
									}else if(error !== null){
										console.log("Inventory error: "+ error);
									}
									
								})
								
						
								function createPlayer(thisPlayer, inventory){
									playerGear = new Array();
									inventory.forEach((equippedItem) =>{
										if(equippedItem.CustomData.isEquipped == 'true'){ //Get the items the player is wearing
											let item, ItemClass, ItemId, isEquipped;
											ItemClass = equippedItem.ItemClass;
											ItemId = equippedItem.ItemId;
											isEquipped = equippedItem.CustomData;
											item = {ItemClass, ItemId, isEquipped}; //Removes informations that may affect the security
											playerGear.push(item);
										}
										
									})
									thisPlayer = new Player(PlayFabId, resultFromAuthentication.data.UserInfo.TitleInfo.DisplayName, 500, 460, 62, 82, false, 500, 460, "", false, playerGear);
									if(server_utils.getElementFromArrayByValue(PlayFabId, 'id', devTeam.devs) != false){
										thisPlayer.isDev = true;
									};
									if(socket.disconnected == true) return
									players.push(thisPlayer);
									socket.playerId = resultFromAuthentication.data.UserInfo.PlayFabId;
									socket.join(rooms.town.name);
									socket.gameRoom = rooms.town.name;
									rooms.town.players.push(thisPlayer);
									socket.emit('readyToPlay?');	//Say to the client he/she can already start playing
									socket.broadcast.to(socket.gameRoom).emit('newPlayer', thisPlayer); //Emit this player to all clients logged in
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
		let thisPlayerRoom = server_utils.getElementFromArrayByValue(socket.gameRoom, 'name', Object.values(rooms));
		let preventRecursion = thisPlayerRoom.players;
		preventRecursion.forEach(player=>{
			if(player.isMoving == true){
				clearInterval(player.movePlayerInterval);
				player.isMoving == false;
			}
		})
		socket.emit('loggedIn', (preventRecursion)); //there is a problem here
		socket.isAFK = setTimeout(()=>{
			socket.disconnect(true);
		}, AFKTime)
	})
	socket.on('playerMovement', (playerMovement) =>{
		if(socket.playerId == undefined) return;
		server_utils.resetTimer(socket, AFKTime);
		let thisPlayerRoom = server_utils.getElementFromArrayByValue(socket.gameRoom, 'name', Object.values(rooms));
		let player = server_utils.getElementFromArrayByValue(socket.playerId, 'id', thisPlayerRoom.players);
		let movePlayerObject = {
			id: player.id,
			mouseX: playerMovement.mouseX, 
			mouseY: playerMovement.mouseY
		}
		player.mouseX = playerMovement.mouseX;
		player.mouseY = playerMovement.mouseY;
		if(player.isMoving == false){
			player.move(thisPlayerRoom);
		}else{
			clearInterval(player.movePlayerInterval);
			player.isMoving = false;
			player.move(thisPlayerRoom);
		}
		socket.broadcast.to(socket.gameRoom).emit('playerIsMoving', movePlayerObject);
    })//Player Movement end
	
	socket.on('message',(message)=>{
		if(socket.playerId == undefined) return;
		server_utils.resetTimer(socket, AFKTime);
		let thisPlayerRoom = server_utils.getElementFromArrayByValue(socket.gameRoom, 'name', Object.values(rooms));
		let player = server_utils.getElementFromArrayByValue(socket.playerId, 'id', thisPlayerRoom.players);
		let channel = client.channels.cache.get('845340183984341075');
		let dateUTC = new Date(Date.now()).toUTCString();
		if(message != undefined && server_utils.separateString(message)[0].includes("/") == false){
			isprofanity(message, function(t, blocked){
				if(t == true){
					let messageObject = {
						socket: socket.id,
						message: "🤬"
					}
					console.log(player.username +' said the following bad word: '+ blocked[0].word + ' that looks like ' + blocked[0].closestTo);
					let embed = embedText(dateUTC + '\n' +player.username + ' said the following bad word that looks like ' + blocked[0].closestTo + ':', blocked[0].word);
					//channel.send(embed.setColor("#FF0000"));
					socket.emit('badWord', '🤬');
					socket.broadcast.to(socket.gameRoom).emit('playerSaid', messageObject);
				}else{
					let messageObject = {
						id: player.id,
						message: message
					}
					let embed = embedText(dateUTC + '\n' +player.username + ' said:', message);
					console.log(dateUTC +'\n' + player.username + ' said: ' + message + '\n');
					//channel.send(embed.setColor("1ABBF5"))
					socket.broadcast.to(socket.gameRoom).emit('playerSaid', messageObject);
				}	
				
			},'data/profanity.csv','data/exceptions.csv', 0.4);
		}
	})

	socket.on('/room', (message) =>{
		if(socket.playerId == undefined) return;
		server_utils.resetTimer(socket, AFKTime);
		let thisPlayerRoom = server_utils.getElementFromArrayByValue(socket.gameRoom, 'name', Object.values(rooms));
		let player = server_utils.getElementFromArrayByValue(socket.playerId, 'id', thisPlayerRoom.players);
		message = server_utils.separateString(message);
		let wantedRoom = server_utils.getElementFromArrayByValue(message[1], 'name', Object.values(rooms));
		if(wantedRoom == false) return; //Check if the room the player wants to go exists
		if(player.isMoving == true){
			clearInterval(player.movePlayerInterval);
			player.isMoving = false;
		}
		player.x = wantedRoom.exit[0];
		player.y = wantedRoom.exit[1];
		server_utils.removeElementFromArray(player, thisPlayerRoom.players); //Remove player from the room
		socket.broadcast.to(socket.gameRoom).emit('byePlayer', player);//Say to everyone on the room that this player is gone
		socket.emit('leaveRoom');
		socket.leave(socket.gameRoom); //Leave room on server
		socket.join(wantedRoom.name); //Join new room
		socket.gameRoom = wantedRoom.name;
		wantedRoom.players.push(player);
		socket.emit('joinRoom',{name: wantedRoom.name, posX: player.x, posY: player.y});
		socket.broadcast.to(socket.gameRoom).emit('newPlayer', (player)); //Say to everyone on the new room that the player is there
		let preventRecursion = wantedRoom.players;
		preventRecursion.forEach(player =>{
			if(player.isMoving == true){
				clearInterval(player.movePlayerInterval);
				player.isMoving = false;
			}
		})
		socket.emit('loggedIn', (preventRecursion)); //Say to the player who are in the new room
	})

	socket.on('/updateInventory', (message) => {
		if(socket.playerId == undefined || message !== true) return;
		server_utils.resetTimer(socket, AFKTime);
		let thisPlayerId = socket.playerId;
		let thisPlayerRoom = server_utils.getElementFromArrayByValue(socket.gameRoom, 'name', Object.values(rooms));
		let player = server_utils.getElementFromArrayByValue(socket.playerId, 'id', thisPlayerRoom.players);
		PlayFabAdmin.GetUserInventory({PlayFabId: socket.playerId}, (error,result) =>{
			if(result !== null){
				let items = new Array();
				result.data.Inventory.forEach((item) =>{
					if(item.CustomData.isEquipped == 'true'){
						let ItemId, ItemClass, CustomData;
						ItemId = item.ItemId;
						ItemClass = item.ItemClass;
						CustomData = item.CustomData;
						items.push({ItemId, ItemClass, CustomData});
					}
				})
				player.items = items;
				socket.broadcast.to(socket.gameRoom).emit('playerUpdatedGear', {player: thisPlayerId, gear: items});
			}else if(error !== null){
				console.log(error);
			}
		})
	})
	//Moderations functions
	socket.on('/report', (message) =>{
		if(socket.playerId == undefined) return;
		server_utils.resetTimer(socket, AFKTime);
		let thisPlayerRoom = server_utils.getElementFromArrayByValue(socket.gameRoom, 'name', Object.values(rooms));
		let reporter = server_utils.getElementFromArrayByValue(socket.playerId, 'id', thisPlayerRoom.players); //The user who is reporting

		message = server_utils.separateString(message);
		let playerName = message[1];
		if(playerName == undefined || message[2] == undefined) return;

		server_utils.getPlayfabUserByUsername(playerName).then(response =>{
			let reportMessage = message.slice(2, message.length);
			reportMessage = reportMessage.toString().split(',').join(' ');
			let channel = client.channels.cache.get('845340393461645352'); //Connect to report channel on discord
			PlayFabServer.ReportPlayer({ReporterId: reporter.id, ReporteeId: response.data.UserInfo.PlayFabId, Comment: reportMessage}, (error, result) =>{
				if(result !== null){
					let dateUTC = new Date(Date.now()).toUTCString();
					console.log(result); //result.data.Updated
					let embed = embedText(dateUTC + '\n' + reporter.username + ' reported ' + playerName, reportMessage);
					channel.send(embed.setColor('FFFB00'));
				}else if(error !== null){
					console.log(error);	//error.errorMessage
				}
			});
		}).catch(console.log);
		
	})
	
	socket.on('/ban', (message) =>{
		if(socket.playerId == undefined) return;
		server_utils.resetTimer(socket, AFKTime);
		let thisPlayerRoom = server_utils.getElementFromArrayByValue(socket.gameRoom, 'name', Object.values(rooms));
		let player = server_utils.getElementFromArrayByValue(socket.playerId, 'id', thisPlayerRoom.players);

		if(player.isDev == true){	//Template of the message should be /ban timeOfBan banPlayerName reason
			message = server_utils.separateString(message);
			let timeOfBan = message[1];
			let banPlayerName = message[2];
			let reason = message.slice(3,message.length);
			reason = reason.toString().split(',').join(' '); //Returns the reason with spaces
			
			if(isNaN(timeOfBan) == true || banPlayerName == undefined || reason == undefined) return; //Check if the message is in correct form
			
			let banRequest;

			server_utils.getPlayfabUserByUsername(banPlayerName).then(response => { 
				let banPlayerId = response.data.UserInfo.PlayFabId;
				if(server_utils.getElementFromArrayByValue(banPlayerId, 'id', devTeam.devs) == false){ //Find if the mod is not trying to ban a dev
					if(timeOfBan === '9999'){	//Perma ban
						banRequest = {
							Bans: [{PlayFabId: banPlayerId, Reason: reason}]
						}
					}else{
						banRequest = {
							Bans: [{DurationInHours: timeOfBan, PlayFabId: banPlayerId, Reason: reason}]
						}
					}
				
					PlayFabServer.BanUsers(banRequest, (error, result) =>{	//Ban request to playfab
						if(result !== null){
							console.log(result);
							let removeBannedPlayerSocket = server_utils.getElementFromArrayByValue(banPlayerId, 'playerId', io.sockets.sockets);
							socket.emit('playerBanned!');
							if(removeBannedPlayerSocket == false) return; //Check if the player is online
							removeBannedPlayerSocket.disconnect(true);
						}else if(error !== null){
							console.log(error)
						}
					})
				}
			}).catch(console.log); //Log error

		}// IsDev final
	});

	socket.on('/unban', (message) =>{
		if(socket.playerId == undefined) return;
		server_utils.resetTimer(socket, AFKTime);
		let thisPlayerRoom = server_utils.getElementFromArrayByValue(socket.gameRoom, 'name', Object.values(rooms));
		let player = server_utils.getElementFromArrayByValue(socket.playerId, 'id', thisPlayerRoom.players);

		if(player.isDev == true){	//Template of the message should be /unban banPlayerName
			message = server_utils.separateString(message);
			let banPlayerName = message[1];
			if(banPlayerName == undefined) return; //Check if the message is in the correct form.
			
			server_utils.getPlayfabUserByUsername(banPlayerName).then(response =>{
				PlayFabServer.RevokeAllBansForUser({PlayFabId: response.data.UserInfo.PlayFabId}, (error, result) =>{	//Revoke All Bans from user
					if(result !== null){
						console.log(result);
						socket.emit('playerUnbanned!');
					}else if(error !== null){
						console.log(error);
					}
				});
			}).catch(console.log);
		}
	})

	socket.on('/remove', (message) =>{
		if(socket.playerId == undefined) return;
		server_utils.resetTimer(socket, AFKTime);
		let thisPlayerRoom = server_utils.getElementFromArrayByValue(socket.gameRoom, 'name', Object.values(rooms));
		let player = server_utils.getElementFromArrayByValue(socket.playerId, 'id', thisPlayerRoom.players);

		if(player.isDev == true){
			message = server_utils.separateString(message);
			let removePlayerObject = server_utils.getElementFromArrayByValue(message[1], 'username', thisPlayerRoom.players);
			if(removePlayerObject == false) return;
			let removePlayerSocket = server_utils.getElementFromArrayByValue(removePlayerObject.id, 'playerId', io.sockets.sockets);
			if(removePlayerSocket == false) return;
			removePlayerSocket.disconnect(true);
		}
	})

}) // io connection end

//Start the server on port 3000
http.listen(process.env.PORT || 3000, () => {
	console.log('listening on *:3000');
});

//Start the discord bot
client.login('ODM4NTQ3NTYxNTgwMzMxMDcw.YI8sRg.15hZCkAeqKpFqjMF2jds5Et7o9U');

//discord things
client.on('message' ,(message) =>{
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	if(message.member.roles.cache.has('760901805436960800') || message.member.roles.cache.has('845072414048387102')){
		const args = message.content.slice(prefix.length).trim().split(/ +/);
		const command = args.shift().toLowerCase();
		let messageFromDiscord = server_utils.separateString(message.content);
		let timeOfBan = messageFromDiscord[1];
		let banPlayerName = messageFromDiscord[2];
		let reason = messageFromDiscord.slice(3,messageFromDiscord.length);
		reason = reason.toString().split(',').join(' '); //Returns the reason with spaces
		if(isNaN(timeOfBan) == true || banPlayerName == undefined || reason == undefined) {return message.channel.send(embedText('Error:', 'Command contains invalid parameters.').setColor('#FFFB00'));} //Check if the message is in correct form
		let banRequest;

		if(command == 'ban' && banPlayerName != undefined){
			server_utils.getPlayfabUserByUsername(banPlayerName).then(response =>{
				let banMessage = response.data.UserInfo.TitleInfo.DisplayName + ' was banned.';
				let banPlayerId = response.data.UserInfo.PlayFabId;
					if(timeOfBan === '9999'){	//Perma ban
						banRequest = {
							Bans: [{PlayFabId: banPlayerId, Reason: reason}]
						}
					}else{
						banRequest = {
							Bans: [{DurationInHours: timeOfBan, PlayFabId: banPlayerId, Reason: reason}]
						}
					}
					PlayFabServer.BanUsers(banRequest, (error, result) =>{	//Ban request to playfab
						if(result !== null){
							message.channel.send(embedText('Banned:', banMessage).setColor('#FF0000'))
						}else if(error !== null){
							console.log(error)
						}
					})
				}).catch(error =>{
					message.channel.send(embedText('Error:', error.errorMessage).setColor('#FFFB00'))
			});

		}
	}
	
})