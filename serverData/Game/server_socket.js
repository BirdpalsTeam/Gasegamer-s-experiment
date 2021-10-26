//profanity and etc
const fs = require('fs');
const profanity = require('../Utils/profanity filter');
const server_utils = require('../Utils/server-utils');
const server_discord = require('../Discord/server_discord');
const AFKTime = 300000; //5 minutes
//Scripts
var { Player } = require('./Player');
const movement_messages = require('./movement_messages');
const login = require('./login');
const update_inventory = require('./update_inventory');
const change_bio = require('./change_bio');
const give_item = require('./give_item.js');
const moderation_commands = require('./moderation_commands');
//DDoS prevention
const { RateLimiterMemory } = require('rate-limiter-flexible');
const rateLimiter = new RateLimiterMemory({points: 3, duration: 1});
const movementLimiter = new RateLimiterMemory({points: 5, duration: 1});

exports.connect = (io, PlayFabServer, PlayFabAdmin, client) => {
	var roomsJson = fs.readFileSync('./serverData/Utils/roomsJSON.json');
	var rooms = JSON.parse(roomsJson);
	var players = new Array();
	var devTeamJson = fs.readFileSync('./serverData/Utils/devTeam.json');
	var devTeam = JSON.parse(devTeamJson);

io.on('connection', (socket) => {
	console.log('A user connected: ' + socket.id);
	/*if(socket.handshake.headers['cf-ray'] == undefined || socket.handshake.headers['cf-connecting-ip'] == undefined ){
		socket.disconnect(true);
	}else{
		socket.ip = socket.handshake.headers['cf-connecting-ip'];
	}uncomment at final build*/
	
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
		rateLimiter.consume(socket.id).then(()=>{
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
		}).catch(() =>{
			console.log(`This jerk is trying to DoS our game ${socket.playerId}`);
		})
		
	})
	
	login.run(io, socket, players, Player, rooms, devTeam, PlayFabServer, PlayFabAdmin, profanity, server_utils, rateLimiter);

	movement_messages.run(socket, rooms, AFKTime, client, server_discord, server_utils, profanity, rateLimiter, movementLimiter); //Rooms command is here

	update_inventory.run(socket, rooms, AFKTime, PlayFabAdmin, PlayFabServer, server_utils, rateLimiter);

	change_bio.run(socket, rooms, AFKTime, PlayFabAdmin, profanity, server_utils, rateLimiter);

	give_item.run(socket, rooms, AFKTime, PlayFabServer, server_utils, rateLimiter);

	moderation_commands.run(io, socket, server_utils, AFKTime, rooms, devTeam, PlayFabServer, client, server_discord);

})} // io connection end