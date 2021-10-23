exports.run = (socket, rooms, AFKTime, PlayFabServer, server_utils, rateLimiter)=>{
    var freeItems = ["eye_patch","pirate_hat"];

    socket.on('getFreeItem', (itemInfo) => {
        rateLimiter.consume(socket.id).then(()=>{
            console.log("Giving item...");
			server_utils.resetTimer(socket, AFKTime);

            playerInventory.forEach((item) =>{
                console.log(item);
            })

            for(let i = 0; i < freeItems.length; i++){
                if(itemInfo.name == freeItems[i]){
					server_utils.grantItemsToUser("Birdpals Catalog", [itemInfo.name], socket.playerId).then(i = freeItems.length).catch(console.log);
                }
            }
			
		}).catch((reason) =>{
			console.log(`This jerk is trying to DoS our game ${socket.playerId} ${reason}`);
		})
    });
}