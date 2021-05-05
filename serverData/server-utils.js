
const { PlayFab, PlayFabAdmin } = require('playfab-sdk');
var GAME_ID = '238E6';
PlayFab.settings.titleId = GAME_ID;
PlayFab.settings.developerSecretKey = 'KYBWN8AEATIQDEBHQTXUHS3Z5ZKWSF4P3JTY5HD9COQ1KCUHXN';

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
	getPlayfabUserByUsername: function getPlayfabUserByUsername(username){
		PlayFabAdmin.GetUserAccountInfo({Username: username}, (error, result) =>{
			if(result !== null){
				return result;
			}else if(error !== null){
				console.log(error);
			}
		})
	}
}
console.log(functions.getPlayfabUserByUsername('Gasegamer'))
module.exports = functions;