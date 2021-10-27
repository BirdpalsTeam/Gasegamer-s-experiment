exports.run = (socket, AFKTime, PlayFabServer, server_utils, rateLimiter)=>{
    socket.on('/addFriend', (friend) => {
        rateLimiter.consume(socket.id).then(()=>{
			if(socket.playerId == undefined) return;
			server_utils.resetTimer(socket, AFKTime);
			friend = server_utils.separateString(friend)[1];
			server_utils.getPlayfabUserByUsername(friend).then((response) =>{
				PlayFabServer.ExecuteCloudScript({PlayFabId: socket.playerId, FunctionName: "SendFriendRequest", FunctionParameter: {FriendPlayFabId: response.data.UserInfo.PlayFabId}, GeneratePlayStreamEvent: true}, (error, result) =>{
					if(error !== null){
						console.log(error);
					}else if (result !== null){
						console.log(result);
					}
				})
			}).catch(console.log)
		});
    });

	socket.on('/acceptFriend', (friend) => {
        rateLimiter.consume(socket.id).then(()=>{
			if(socket.playerId == undefined) return;
			server_utils.resetTimer(socket, AFKTime);
			friend = server_utils.separateString(friend)[1];
			server_utils.getPlayfabUserByUsername(friend).then((response) =>{
				server_utils.getFriendsList(socket.playerId).then((friendsList)=>{
					let isRequestee = server_utils.getElementFromArrayByValue(response.data.UserInfo.PlayFabId, 'FriendPlayFabId', friendsList.data.Friends);
					if(isRequestee != false && isRequestee.Tags[0] == "requester"){ //Make sure your aren't the requester
						PlayFabServer.ExecuteCloudScript({PlayFabId: socket.playerId, FunctionName: "AcceptFriendRequest", FunctionParameter: {FriendPlayFabId: response.data.UserInfo.PlayFabId}, GeneratePlayStreamEvent: true}, (error, result) =>{
							if(error !== null){
								console.log(error);
							}else if (result !== null){
								console.log(result);
							}
						})
					}
				})
			}).catch(console.log)
		});
    });

	socket.on('/denyFriend', (friend) => {
        rateLimiter.consume(socket.id).then(()=>{
			if(socket.playerId == undefined) return;
			server_utils.resetTimer(socket, AFKTime);
			friend = server_utils.separateString(friend)[1];
			server_utils.getPlayfabUserByUsername(friend).then((response) =>{
				PlayFabServer.ExecuteCloudScript({PlayFabId: socket.playerId, FunctionName: "DenyFriendRequest", FunctionParameter: {FriendPlayFabId: response.data.UserInfo.PlayFabId}, GeneratePlayStreamEvent: true}, (error, result) =>{
					if(error !== null){
						console.log(error);
					}else if (result !== null){
						console.log(result);
					}
				})
			}).catch(console.log)
		});
    });
}