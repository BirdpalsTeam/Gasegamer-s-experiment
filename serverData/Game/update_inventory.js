exports.run = (socket, rooms, AFKTime, PlayFabAdmin, PlayFabServer, server_utils, rateLimiter)=>{
	socket.on('/updateInventory', (playerInventory) => {
		rateLimiter.consume(socket.id).then(()=>{
			if(socket.playerId == undefined || playerInventory == undefined) return;
			server_utils.resetTimer(socket, AFKTime);
			let thisPlayerId = socket.playerId;
			let thisPlayerRoom = server_utils.getElementFromArrayByValue(socket.gameRoom, 'name', Object.values(rooms));
			let player = server_utils.getElementFromArrayByValue(socket.playerId, 'id', thisPlayerRoom.players);
			PlayFabAdmin.GetUserInventory({PlayFabId: socket.playerId}, (error,result) =>{
				if(result !== null){
					let items = new Array();
					let equippedItems = 0;
					let updatedPlayfab = 0;
					
					playerInventory.forEach((item) =>{
						if(server_utils.getElementFromArray(item, "ItemId", result.data.Inventory) !== false){
							if(item.CustomData.isEquipped == "true"){
								playerInventory.forEach((fItem) =>{
									if(fItem.ItemClass == item.ItemClass && fItem.ItemId != item.ItemId && fItem.CustomData.isEquipped == "true"){
										fItem.CustomData.isEquipped = "false";
										fItem.button.isSelected = false;
									}
								})
								equippedItems += 1;
								PlayFabServer.UpdateUserInventoryItemCustomData({PlayfabId: socket.playerId, ItemInstanceId: item.ItemInstanceId, Data: {"isEquipped": "true"}}, (error, result) =>{
									if(result !== null){
										updatedPlayfab += 1;
										items.push({ItemClass: item.ItemClass, ItemId: item.ItemId, isEquipped: item.CustomData});
										if(updatedPlayfab == equippedItems){
											player.items = items;
											socket.broadcast.to(socket.gameRoom).emit('playerUpdatedGear', {player: thisPlayerId, gear: items});
											socket.emit('changingInventory', false);
										}
									//	console.log(result);
									}else if(error !== null){
										console.log(error);
									}
								})
							}else if(item.CustomData.isEquipped == "false"){
								equippedItems += 1;
								PlayFabServer.UpdateUserInventoryItemCustomData({PlayfabId: socket.playerId, ItemInstanceId: item.ItemInstanceId, Data: {"isEquipped": "false"}}, (error, result) =>{
									if(result !== null){
										updatedPlayfab += 1;
										if(updatedPlayfab == equippedItems){
											player.items = items;
											socket.broadcast.to(socket.gameRoom).emit('playerUpdatedGear', {player: thisPlayerId, gear: items});
											socket.emit('changingInventory', false);
										}
									}else if(error !== null){
										console.log(error);
									}
								})
							}
						}
					})
				}else if(error !== null){
					console.log(error);
				}//User inventory end
			})
		}).catch((reason)=>{
			console.log(`This guy is trying to DoS login event ${socket.id} ${reason}`)
		})
		
	})
}