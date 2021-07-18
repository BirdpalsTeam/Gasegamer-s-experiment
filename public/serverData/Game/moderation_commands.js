exports.run = (io, socket, server_utils, AFKTime ,rooms, devTeam, PlayFabServer) =>{
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
					let embed = server_discord.embedText(dateUTC + '\n' + reporter.username + ' reported ' + playerName, reportMessage);
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
}