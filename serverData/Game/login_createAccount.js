exports.run = (io, socket, players, Player, rooms, devTeam, PlayFabServer, PlayFabClient, PlayFabAdmin, isprofanity, server_utils, rateLimiter) =>{
	socket.on('createAccount', (create)=>{
		rateLimiter.consume(socket.id).then(()=>{
			isprofanity(create.username,function(t){
				if(t == true){
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
						socket.emit('youAreBanned'); 
						return;
					}
					
					PlayFabServer.GetPlayerProfile(playerProfileRequest, (error,result)=>{ //Get player profile
						if(result !== null && result.data.PlayerProfile.ContactEmailAddresses[0] != undefined){
								if(result.data.PlayerProfile.ContactEmailAddresses[0].VerificationStatus == "Confirmed"){ //Player is verified

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
															socket.emit('alreadyLoggedIn');
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
		}).catch(()=>{
			console.log(`This guy is trying to DoS login event ${socket.id}`)
		})
	})
	
}