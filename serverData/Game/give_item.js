exports.run = (socket, AFKTime, PlayFabServer, server_utils, rateLimiter)=>{
    var freeItems = ["eye_patch","pirate_hat"];

    socket.on('/getFreeItem', (itemInfo) => {
        rateLimiter.consume(socket.id).then(()=>{
			server_utils.resetTimer(socket, AFKTime);
			itemInfo = {name: server_utils.separateString(itemInfo)[1]};
            server_utils.getPlayerInventory(socket.playerId).then(result =>{
                let alreadyHasItem = false;
                result.data.Inventory.forEach(item=>{
                    if(item.ItemId == itemInfo.name){
                        alreadyHasItem = true;
                        return;
                    }
                });
                if(!alreadyHasItem){
                    for(let i = 0; i < freeItems.length; i++){
                        if(itemInfo.name == freeItems[i]){
                            server_utils.grantItemsToUser("Birdpals Catalog", [itemInfo.name], socket.playerId).then(result =>{
                                i = freeItems.length;
                                let tempItemInstanceId = result.data.ItemGrantResults[0].ItemInstanceId;
                                PlayFabServer.UpdateUserInventoryItemCustomData({PlayFabId:socket.playerId,ItemInstanceId:tempItemInstanceId,Data: {"isEquipped": "false"}});
                            }).catch(console.log);
                        }
                    }
                }
            })
			
		}).catch((reason) =>{
			console.log(`This jerk is trying to DoS our game ${socket.playerId} ${reason}`);
		})
    });
}