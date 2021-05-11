const { PlayFab, PlayFabAdmin } = require('playfab-sdk');
var GAME_ID = '238E6';
PlayFab.settings.titleId = GAME_ID;
PlayFab.settings.developerSecretKey = 'KYBWN8AEATIQDEBHQTXUHS3Z5ZKWSF4P3JTY5HD9COQ1KCUHXN';
var url = require('url')
var https = require('https');
const { response } = require('express');
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
	separateString: function separateStrings(string){
		if(string == undefined) return;
		let separated = string.split(" ");
		return separated;
	}
}

module.exports = functions;