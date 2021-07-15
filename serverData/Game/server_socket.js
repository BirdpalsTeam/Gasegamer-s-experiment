//isProfanity and etc
const fs = require('fs');
const isProfanity = require('isprofanity');
const server_utils = require('../Utils/server-utils');
const server_discord = require('../Discord/server_discord');
const AFKTime = 300000; //5 minutes
const movement_messages = require('./movement_messages');
const login_createAccount = require('./login_createAccount');
const moderation_commands = require('./moderation_commands');
exports.connect = (io, PlayFabServer, PlayFabAdmin, PlayFabClient, client) => {
	var roomsJson = fs.readFileSync('./serverData/Utils/roomsJSON.json');
	var rooms = JSON.parse(roomsJson);
	
	var players = new Array();
	
	class Player{
		constructor(id, username, items=[]){
			this.id = id;
			this.username = username;
			this.x = 500;
			this.y = 460;
			this.width = 62;
			this.height = 82;
			this.isMoving = false;
			this.mouseX = 500;
			this.mouseY = 460;
			this.message = "";
			this.movePlayerInterval;
			this.isDev = false;
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

	var devTeamJson = fs.readFileSync('./serverData/Utils/devTeam.json');
	var devTeam = JSON.parse(devTeamJson);

io.on('connection', (socket) => {
	console.log('A user connected: ' + socket.id);

	socket.on('disconnect', function(){
		console.log('A user disconnected: ' + socket.id);
		if(players.length > 0){
			let disconnectedPlayer = server_utils.getElementFromArrayByValue(socket.playerId, 'id', players);
			let thisPlayerRoom = server_utils.getElementFromArrayByValue(socket.gameRoom, 'name', Object.values(rooms));
			if(disconnectedPlayer == false || thisPlayerRoom.players == false) return;
			let thisPlayer = server_utils.getElementFromArrayByValue(socket.playerId, 'id', thisPlayerRoom.players);
			if(thisPlayer.isMoving == true){
				clearInterval(thisPlayer.movePlayerInterval);
				thisPlayer.isMoving == false;
			}
			socket.broadcast.to(socket.gameRoom).emit('byePlayer', disconnectedPlayer);
			server_utils.removeElementFromArray(disconnectedPlayer, players);
			server_utils.removeElementFromArray(disconnectedPlayer, thisPlayerRoom.players);
		}
	})
	
	socket.on('Im Ready', () =>{
		if(socket.playerId == undefined) return;
		let thisPlayerRoom = server_utils.getElementFromArrayByValue(socket.gameRoom, 'name', Object.values(rooms));
		//socket.io can't send running functions, so you need to pause the players movement
		let preventRecursion = thisPlayerRoom.players;
		preventRecursion.forEach(player=>{
			if(player.isMoving == true){
				clearInterval(player.movePlayerInterval);
				player.isMoving == false;
			}
		})
		socket.emit('loggedIn', (preventRecursion)); //there is a problem here
		socket.isAFK = setTimeout(()=>{	//AFK cronometer
			socket.disconnect(true);
		}, AFKTime)
	})

	login_createAccount.run(io, socket, players, Player, rooms, devTeam, PlayFabServer, PlayFabClient, PlayFabAdmin, isProfanity, server_utils);

	movement_messages.run(socket, rooms, AFKTime, client, server_discord, server_utils, isProfanity); //Rooms command is here

	moderation_commands.run(io, socket, server_utils, AFKTime, rooms, devTeam, PlayFabServer);

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

})} // io connection end