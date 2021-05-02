const { PlayFabAdmin } = require("playfab-sdk");

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
	}
}

module.exports = functions;