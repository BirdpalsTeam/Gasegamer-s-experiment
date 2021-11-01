const { PlayFab, PlayFabAdmin, PlayFabServer } = require('playfab-sdk');
var GAME_ID = '238E6';
PlayFab.settings.titleId = GAME_ID;
PlayFab.settings.developerSecretKey = '1YP575JK5RZOJFRMMSAT5DWWOG9FI6967KNH3YCCIKFQT7SNK7';

functions = {
	getElementFromArray:	function getElementFromArray(element, customIdentifier, array){
		let tempElement;
		array.forEach(arrayElement =>{
			if(arrayElement[customIdentifier] === element[customIdentifier]){
				tempElement = arrayElement;
			}
		})
		return tempElement != undefined ? tempElement : false;
	},
	getElementFromArrayByValue: function getElementFromArrayByValue(value, customIdentifier, array){
		let tempElement;
		array.forEach(arrayElement =>{
			if(arrayElement[customIdentifier] == value){
				tempElement = arrayElement;
			}
		});
		return tempElement != undefined ? tempElement : false;
	},
	checkIfElementIsInArray:	function checkIfElementIsInArray(element, customIdentifier, array){
		return functions.getElementFromArray(element, customIdentifier, array) ? true : false;
	},
	removeElementFromArray: function removeElementFromArray(element, array){
		array.splice(array.indexOf(element), 1);
	},
	resetTimer: function resetTimer(timer, time){
		clearTimeout(timer.isAFK);
		timer.isAFK = setTimeout(()=>{
			timer.disconnect(true);
		}, time);
	},
	getPlayfabUserByUsername: async function getPlayfabUserByUsername(username){
		return await new Promise((resolve, reject) =>{
				PlayFabAdmin.GetUserAccountInfo({Username: username}, (error, result) =>{
					if(result !== null){
						resolve(result);
					}else if(error !== null){
						reject(error);
					}
				})
		})
		
	},
	addPlayerTag: async function addPlayerTag(PlayfabId, tag){
		return await new Promise((resolve, reject) =>{
			PlayFabServer.AddPlayerTag({PlayFabId: PlayfabId, TagName: tag}, (error, result) =>{
				if(result !== null){
					resolve(result);
				}else if(error !== null){
					reject(error);
				}
			})
		})
	},
	getPlayersInSegment: async function getPlayersInSegment(SegmentId){
		return await new Promise((resolve, reject) =>{
			PlayFabServer.GetPlayersInSegment({SegmentId: SegmentId}, (error, result) =>{
				if(result !== null){
					resolve(result);
				}else if(error !== null){
					reject(error);
				}
			})
		})
	},
	getPlayerTags: async function getPlayerTags(PlayFabId){
		return await new Promise((resolve, reject) =>{
			PlayFabServer.GetPlayerTags({PlayFabId: PlayFabId}, (error, result) =>{
				if(result !== null){
					resolve(result);
				}else if(error !== null){
					reject(error);
				}
			})
		})
	},
	removePlayerTag: async function removePlayerTag(PlayFabId, TagName){
		return await new Promise((resolve, reject) =>{
			PlayFabServer.RemovePlayerTag({PlayFabId: PlayFabId,TagName: TagName}, (error, result) =>{
				if(result !== null){
					resolve(result);
				}else if(error !== null){
					reject(error);
				}
			})
		})
	},
	getPlayerInternalData: async function getPlayerInternalData(PlayFabId){
		return await new Promise((resolve, reject) =>{
			PlayFabServer.GetUserInternalData({PlayFabId: PlayFabId}, (error, result) =>{
				if(result !== null){
					resolve(result);
				}else if(error !== null){
					reject(error);
				}
			})
		})
	},
	separateString: function separateStrings(string){
		if(string == undefined) return;
		let separated = string.split(" ");
		return separated;
	},
	grantItemsToUser: async function grantItemsToUser(CatalogVersion, ItemIds, PlayFabId){
		return await new Promise((resolve, reject) =>{
			PlayFabServer.GrantItemsToUser({CatalogVersion: CatalogVersion, ItemIds: ItemIds,PlayFabId: PlayFabId}, (error, result) =>{
				if(result !== null){
					resolve(result);
				}else if(error !== null){
					reject(error);
				}
			})
		})
	},
	changeUserDisplayName: async function changeUserDisplayName(DisplayName, PlayfabId){
		return await new Promise((resolve, reject) =>{
			PlayFabAdmin.UpdateUserTitleDisplayName({DisplayName: DisplayName, PlayFabId: PlayfabId}, (error, result) =>{
				if(result !== null){
					resolve(result);
				}else if(error !== null){
					reject(error);
				}
			})
		})
	},
	getPlayerInventory: async function getPlayerInventory(playerId){
		return await new Promise((resolve, reject) =>{
			PlayFabAdmin.GetUserInventory({PlayFabId:playerId}, (error, result) =>{
				if(result !== null){
					resolve(result);
				}else if(error !== null){
					reject(error);
				}
			})
		})
	},
	getFriendsList: async function getFriendsList(playerId){
		return await new Promise((resolve, reject) =>{
			PlayFabServer.GetFriendsList({PlayFabId:playerId}, (error, result) =>{
				if(result !== null){
					resolve(result);
				}else if(error !== null){
					reject(error);
				}
			})
		})
	}
}
PlayFabAdmin.DeleteMasterPlayerAccount({PlayFabId: '3F51AF758A914586'}, (error, result)=>{
	console.log(result, error);
})
setInterval(() => {
	
}, 1000 / 60);
module.exports = functions;