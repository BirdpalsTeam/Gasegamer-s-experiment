exports.run = (socket, rooms, AFKTime, client, server_discord, server_utils, profanity, rateLimiter, movementLimiter) => {
	socket.on('playerMovement', (playerMovement) =>{
		movementLimiter.consume(socket.id, 1).then(()=>{
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
		}).catch((reason)=>{
			console.log(`stopped the SPAMMER! ${socket.playerId} ${reason} at movement`)
		})
		
    })//Player Movement end

	socket.on('message',(message)=>{
		rateLimiter.consume(socket.id).then(()=>{
			if(socket.playerId == undefined) return;
			server_utils.resetTimer(socket, AFKTime);
			let thisPlayerRoom = server_utils.getElementFromArrayByValue(socket.gameRoom, 'name', Object.values(rooms));
			let player = server_utils.getElementFromArrayByValue(socket.playerId, 'id', thisPlayerRoom.players);
			let channel = client.channels.cache.get('845340183984341075');
			let dateUTC = new Date(Date.now()).toUTCString();
			if(message != undefined && server_utils.separateString(message)[0].includes("/") == false){
				if(profanity.filter(message) == true){
					let messageObject = {
						id: player.id,
						message: "🤬"
					}
					let embed = server_discord.embedText(dateUTC + '\n' + player.username + ' said:', message);
					console.log(dateUTC +'\n' + player.username + ' said: ' + message + '\n');
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
		}
		}).catch((reason)=>{
			console.log(`stopped the SPAMMER! ${socket.playerId} ${reason} at messages`)
		})
		
	})

	socket.on('/room', (message) =>{
		rateLimiter.consume(socket.id).then(()=>{
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
					player.x = player.mouseX;
					player.y = player.mouseY;
				}
			})
			socket.emit('loggedIn', (preventRecursion)); //Say to the player who are in the new room
		}).catch(()=>{
			console.log(`This guy is trying to DoS /rooms ${socket.playerId}`);
		})
	})
}