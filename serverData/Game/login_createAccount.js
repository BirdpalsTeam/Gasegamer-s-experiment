exports.run = (io, socket, players, Player, rooms, devTeam, PlayFab, PlayFabServer, PlayFabClient, PlayFabAdmin, profanity, server_utils, rateLimiter) =>{
	socket.on('createAccount', (create)=>{
		rateLimiter.consume(socket.id).then(()=>{
			if(profanity.filter(create.username) == true){
				console.log('Player name is a bad word');
				socket.emit('dirtyWord');
			}else{
				if(create.username != "" && create.password != "" || create.username != " " && create.password != " "){
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
							let PlayFabId = result.data.PlayFabId;
							console.log("Someone created an account!");
							PlayFabClient.AddOrUpdateContactEmail(addContactEmailRequest, (error, result) => {
								if(result !== null){
									console.log(`Contact email added for ${create.username}!`);
									server_utils.addPlayerTag(PlayFabId, 'isReliable').then(() =>{
										console.log(`Added isReliable to ${create.username}`);
										server_utils.addPlayerTag(PlayFabId, 'isNotVerified').then(()=>{
											console.log(`Added isNotVerified to ${create.username}`);
											socket.emit('accountCreated!');
										}).catch((error)=>{
											console.log(error);
										})
									}).catch((error) =>{
										console.log(error);
									})
								}else if (error !== null){
									console.log('Something went wrong... ' + error);
								}
							})
							
						} else if (error !== null) {
							console.log("Something went wrong with your API call.");
							console.log("Here's some debug information:");
							console.log(error);
							socket.emit('error', error);
							socket.disconnect(true);
						}
					}
				}
			}
		}).catch(()=>{
			console.log(`This guy is trying to DoS createAccount ${socket.id}`);
		})
	})

	socket.on('login',(ticket)=>{
		rateLimiter.consume(socket.id).then(()=>{
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
						socket.emit('error', 'Sorry, but you are banned.'); 
						socket.disconnect(true)
						return;
					}else{
						server_utils.getPlayersInSegment('1B7192766262CE36').then((response)=>{
							let bannedList = response.data.PlayerProfiles;
							if(bannedList.length > 0){
								bannedList.forEach((player) =>{
									PlayFabServer.GetUserBans({PlayFabId: player.PlayerId}, (error, result) =>{
										if(result !== null){
											result.data.BanData.forEach((ban) =>{
												if(ban.Active == true && ban.IPAddress != undefined){
													if(socket.handshake.headers['cf-connecting-ip'] == ban.IPAddress){
														socket.emit('error', 'The IP making this request was banned. Player Banned: ' + player.DisplayName + '. Reason of the ban: ' + ban.Reason + '. Ban expires at: ' + new Date(ban.Expires));
														socket.disconnect(true);
														return;
													}
												}
											})
										}else if(error !== null){
											console.log(error);
										}
									})
								})
							}
						}).catch((error) =>{
							console.log(error)
						});
					}
					/*PlayFabAdmin.UpdateUserInternalData({PlayFabId: PlayFabId, Data: {ipaddress: socket.ip}}, (error,result) =>{
						if(result !== null){
						}else if(error !== null){
							console.log(error);
						}
					})uncomment at final build */

					PlayFabServer.GetPlayerProfile(playerProfileRequest, (error,result)=>{ //Get player profile
						if(result !== null && result.data.PlayerProfile.ContactEmailAddresses[0] != undefined){
								if(result.data.PlayerProfile.ContactEmailAddresses[0].VerificationStatus == "Confirmed"){ //Player is verified
									server_utils.getPlayerTags(PlayFabId).then((response) =>{
										response.data.Tags.forEach((tag) =>{
											if(tag.includes('isNotVerified')){ //This tag is added when the player creates an account
												server_utils.removePlayerTag(PlayFabId, 'isNotVerified').then(()=>{
													server_utils.addPlayerTag(PlayFabId, 'Verified').then().catch((error)=>{ //Player is verified
														console.log(error);
													});
												}).catch((error) =>{
													console.log(error);
												});
											}
											if(tag.includes('isReliable')){ //Ensures that the player was created by this server.
												PlayFabAdmin.GetUserInventory({PlayFabId: PlayFabId}, (error, result) =>{ //Get player inventory
													if(result !== null){
														let inventory = result.data.Inventory;
			
														PlayFabAdmin.GetUserReadOnlyData({PlayFabId: PlayFabId}, (error, result) =>{ //Get Biography
															if(result !== null){
																let biography;
																//Check if the player has a biography.
																result.data.Data.biography == undefined ? biography = "I like to play Birdpals!" : biography = result.data.Data.biography.Value;
																if(result.data.Data.biography != undefined && result.data.Data.biography.Value.includes("🖕")){
																	biography = "love";
																}
																if(players.length > 0){	//Check if there is at least one player online
																	let logged, preventRecursion;
																	preventRecursion = io.sockets.sockets;
																	let playerAlreadyLogged = server_utils.getElementFromArrayByValue(PlayFabId, 'playerId', preventRecursion);
																	//Check if the player is already logged in
																	if(playerAlreadyLogged != false){
																		socket.emit('error', 'You are already logged in! Please enter with another account or try to login again.');
																		//It is needed to stop the player's movement from the account that it is already logged.
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
																	
																	logged == true ? logged = false : createPlayer(PlayFabId, inventory, biography);	//If the player is not logged in create player
																	
																}else{	//If not create this first player
																	createPlayer(PlayFabId, inventory, biography);
																}
															}else if(error !== null){
																console.log("Get User Readable data error: " + error);
															}
														})
													}else if(error !== null){
														console.log("Inventory error: "+ error);
													}
													
												})
											}
											if(tag.includes('isBanned') && resultFromAuthentication.data.UserInfo.TitleInfo.isBanned == false){ //Remove isBanned tag for unbanned players.
												server_utils.removePlayerTag(PlayFabId, 'isBanned').then().catch((error) =>{
													console.log(error);
												});
											}
										})
									}).catch((error) =>{
										console.log(error);
									})
							
									function createPlayer(thisPlayer, inventory, biography){
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
										thisPlayer = new Player(PlayFabId, resultFromAuthentication.data.UserInfo.TitleInfo.DisplayName, playerGear, biography);
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
		
								socket.emit('error', 'You are not verified! Please check your e-mail to verify your account.');
								socket.disconnect(true);
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
		}).catch(()=>{
			console.log(`This guy is trying to DoS login event ${socket.id}`)
		})
	})
	
}