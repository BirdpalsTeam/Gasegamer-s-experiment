exports.run = (io, socket, players, Player, rooms, devTeam, PlayFabServer, PlayFabAdmin, profanity, server_utils, rateLimiter) =>{

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
						socket.emit('errors', 'Sorry, but you are banned.'); 
						socket.disconnect(true)
						return;
					}else{
						/*server_utils.getPlayersInSegment('1B7192766262CE36').then((response)=>{
							let bannedList = response.data.PlayerProfiles;
							if(bannedList.length > 0){
								bannedList.forEach((player) =>{
									PlayFabServer.GetUserBans({PlayFabId: player.PlayerId}, (error, result) =>{
										if(result !== null){
											result.data.BanData.forEach((ban) =>{
												if(ban.Active == true && ban.IPAddress != undefined){
													if(socket.handshake.headers['cf-connecting-ip'] == ban.IPAddress){
														socket.emit('errors', 'The IP making this request was banned. Player Banned: ' + player.DisplayName + '. Reason of the ban: ' + ban.Reason + '. Ban expires at: ' + new Date(ban.Expires));
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
						}).catch(console.log);*/
					}
					/*PlayFabAdmin.UpdateUserInternalData({PlayFabId: PlayFabId, Data: {ipaddress: socket.ip}}, (error,result) =>{
						if(error !== null){
							console.log(error);
						}
					})uncomment at final build */
					let userInfo = resultFromAuthentication.data.UserInfo;
					let playerTags = new Array();

					function addReabilityToPlayerAccount(PlayFabId, userInfo){
						server_utils.addPlayerTag(PlayFabId, 'isReliable').then(() => {
							console.log(`Added isReliable to ${userInfo.Username}`);
							server_utils.addPlayerTag(PlayFabId, 'isNotVerified').then(()=>{
								console.log(`Added isNotVerified to ${userInfo.Username}`);
							}).catch(console.log);
						}).catch(console.log);
					}

					server_utils.getPlayerTags(PlayFabId).then((response) =>{
						playerTags = response.data.Tags; //Gets tags from playfab
						//playerTags.indexOf('title.238E6') == -1 means that this player doesn't have the isReliable tag
						if(userInfo.PrivateInfo.Email != undefined && userInfo.TitleInfo.Created != undefined && playerTags.indexOf('title.238E6.isReliable') == -1){
							if(profanity.filter(userInfo.TitleInfo.DisplayName) == true){ //If user's display name is a bad word, it changes to Bird + randomId
								let randomId = '';
								let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
								let charactersLength = characters.length;
								for ( var i = 0; i < 5; i++ ) {
									randomId += characters.charAt(Math.floor(Math.random() * charactersLength));
								}
								server_utils.changeUserDisplayName("Bird" + randomId, PlayFabId).then(() =>{
									console.log('Changed the display name of ' + PlayFabId);
									socket.emit('errors', 'Ooops! Sorry, something went wrong. Please, try again later.');
									return addReabilityToPlayerAccount(PlayFabId, userInfo);	
								}).catch(console.log);
							}else{
								return addReabilityToPlayerAccount(PlayFabId, userInfo);
							}
						}else{
							PlayFabServer.GetPlayerProfile(playerProfileRequest, (error, result)=>{ //Get player profile
								if(result !== null && result.data.PlayerProfile.ContactEmailAddresses[0] != undefined){
										if(result.data.PlayerProfile.ContactEmailAddresses[0].VerificationStatus == "Confirmed"){ //Player is verified
											if(playerTags.indexOf('title.238E6.isNotVerified') != -1){ //This tag is added when the player creates an account
												server_utils.removePlayerTag(PlayFabId, 'isNotVerified').then(()=>{
													server_utils.addPlayerTag(PlayFabId, 'Verified').then().catch(console.log) //Player is verified
												}).catch(console.log);
											}
											if(playerTags.indexOf('title.238E6.isReliable') != -1){ //Ensures that the player was verified by this server.
												PlayFabAdmin.GetUserInventory({PlayFabId: PlayFabId}, (error, result) =>{ //Get player inventory
													if(result !== null){
														let inventory = result.data.Inventory;

														PlayFabAdmin.GetUserReadOnlyData({PlayFabId: PlayFabId}, (error, result) =>{ //Get Biography
															if(result !== null){
																let biography;
																//Check if the player has a biography.
																result.data.Data.biography == undefined ? biography = "I like to play Birdpals!" : biography = result.data.Data.biography.Value;
																if(result.data.Data.biography != undefined && profanity.filter(biography) == true){
																	biography = "love";
																}
																if(players.length > 0){	//Check if there is at least one player online
																	let logged, preventRecursion;
																	preventRecursion = Object.keys(io.sockets.sockets);
																	let playerAlreadyLogged = server_utils.getElementFromArrayByValue(PlayFabId, 'playerId', preventRecursion);
																	//Check if the player is already logged in
																	if(playerAlreadyLogged != false){
																		socket.emit('errors', 'You are already logged in! Please enter with another account or try to login again.');
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
														console.log("Inventory error: " + error.data);
													}
													
												})
											}
											if(playerTags.indexOf('title.238E6.isBanned') != -1 && resultFromAuthentication.data.UserInfo.TitleInfo.isBanned == false){ //Remove isBanned tag for unbanned players.
												server_utils.removePlayerTag(PlayFabId, 'isBanned').then().catch(console.log);
											}

											function createPlayer(thisPlayer, inventory, biography){
												playerGear = new Array();
												inventory.forEach((equippedItem) =>{
													try{ //This try catch stops the server from crashing until the player opens their inventory.
														if(equippedItem.CustomData.isEquipped == 'true'){ //Get the items the player is wearing
															let item, ItemClass, ItemId, isEquipped;
															ItemClass = equippedItem.ItemClass;
															ItemId = equippedItem.ItemId;
															isEquipped = equippedItem.CustomData;
															item = {ItemClass, ItemId, isEquipped}; //Removes informations that may affect the security
															playerGear.push(item);
														}
													}
													catch(error){
														console.log("There's an error here: " + error);
													}
												})
												thisPlayer = new Player(PlayFabId, resultFromAuthentication.data.UserInfo.TitleInfo.DisplayName, playerGear, biography);
												if(server_utils.getElementFromArrayByValue(PlayFabId, 'id', devTeam.devs) != false){
													thisPlayer.isDev = true;
												};
												if(socket.disconnected == true) return;
												players.push(thisPlayer);
												socket.playerId = resultFromAuthentication.data.UserInfo.PlayFabId;
												socket.join(rooms.town.name);
												socket.gameRoom = rooms.town.name;
												rooms.town.players.push(thisPlayer);
												socket.emit('readyToPlay?');	//Say to the client they can already start playing
												socket.broadcast.to(socket.gameRoom).emit('newPlayer', thisPlayer); //Emit this player to all clients logged in
											}
				
									}else if (result.data.PlayerProfile.ContactEmailAddresses[0].VerificationStatus == "Unverified" || result.data.PlayerProfile.ContactEmailAddresses[0].VerificationStatus == "Pending"){
										let SendEmailFromTemplateRequest ={
											EmailTemplateId: '97A33843288F67E',
											PlayFabId: result.data.PlayerProfile.PlayerId
										}
										
										PlayFabServer.SendEmailFromTemplate(SendEmailFromTemplateRequest, (error, result) => {
											if(result !== null){
												console.log('Verification e-mail send to ' + userInfo.Username);
											}else if(error !== null){
												console.log(error);
											}
										})
				
										socket.emit('errors', 'You are not verified! Please check your e-mail to verify your account.');
										socket.disconnect(true);
									}
								}
								else if(error !== null){
									console.log(error)
								}else{
									return socket.emit('errors', 'Ooops! Sorry, something went wrong. Please, try again later.');
								}
							})
						}
					}).catch(console.log);

				}else if (error != null){
					console.log(error);
					socket.emit('errors', 'Ooops! Something went wrong. Please, try again later.');
				}
			})
		}).catch(()=>{
			console.log(`This guy is trying to DoS login event ${socket.id}`)
		})
	})
	
}