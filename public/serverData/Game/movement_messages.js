exports.run = (socket, rooms, AFKTime, client, server_discord, server_utils, isprofanity) => {
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
					let embed = server_discord.embedText(dateUTC + '\n' +player.username + ' said the following bad word that looks like ' + blocked[0].closestTo + ':', blocked[0].word);
					channel.send(embed.setColor("#FF0000"));
					socket.emit('badWord', '🤬');
					socket.broadcast.to(socket.gameRoom).emit('playerSaid', messageObject);
				}else{
					let messageObject = {
						id: player.id,
						message: message
					}
					let embed = server_discord.embedText(dateUTC + '\n' +player.username + ' said:', message);
					console.log(dateUTC +'\n' + player.username + ' said: ' + message + '\n');
					channel.send(embed.setColor("1ABBF5"))
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
}