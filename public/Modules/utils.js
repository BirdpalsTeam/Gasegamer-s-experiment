async function customGetJSON(json){
	return await new Promise((resolve) => {
		$.getJSON(json, (data) =>{
			resolve(data);
		});
	})
}
function getElementFromArray(element, customIdentifier, array){
	let tempElement;
	array.forEach(arrayElement =>{
		if(arrayElement[customIdentifier] === element[customIdentifier]){
			tempElement = arrayElement;
		}
	})
	return tempElement != undefined ? tempElement : false;
}

function checkIfElementIsInArray(element, customIdentifier, array){
	return getElementFromArray(element, customIdentifier, array) ? true : false;
}

function getElementFromArrayByValue(value, customIdentifier, array){
	let tempElement;
	array.forEach(arrayElement =>{
		if(arrayElement[customIdentifier] == value){
			tempElement = arrayElement;
		}
	});
	return tempElement != undefined ? tempElement : false;
}

function hasWhiteSpaces(string){
	return string !== string.replace(/\s/g,"") ? true : false;
}

function isCaptalized(string, PERCENTAGE){

	if(hasWhiteSpaces(string)){					//String has white spaces
		string = string.replace(/\s/g, "")		//Remove white spaces
	}

	let numberOfCaptalizedLetters = 0;
	var specialCharacter = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(string);
	var emoji = /\p{Extended_Pictographic}/u.test(string);
	for(i = 0; i < string.length; i++){
		if(string[i] === string[i].toUpperCase() && specialCharacter == false && emoji == false){ 	//Notice that false here means that it IS an emoji or special character
			numberOfCaptalizedLetters += 1;
		}
	}

	return numberOfCaptalizedLetters >= (string.length/100)* PERCENTAGE ? true : false;
}

function addString(string, index, stringToAdd){
	return string.substring(0, index) + stringToAdd + string.substring(index, string.length);
}

function splitLongText(string){
	let position = Math.round((string.length / 2) - 1); //Get the index of the half of the text
	string = addString(string, position, ' ');
	return string;
}
/* Credits to https://www.html5canvastutorials.com/tutorials/html5-canvas-wrap-text-tutorial/ */

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
	var words = text.split(' ');
	var line = '';

	for(var n = 0; n < words.length; n++) {
	  var testLine = line + words[n] + ' ';
	  var metrics = ctx.measureText(testLine);
	  var testWidth = metrics.width;
	  if (testWidth > maxWidth && n > 0) {
		ctx.fillText(line, x, y);
		line = words[n] + ' ';
		y += lineHeight;
	  }
	  else {
		line = testLine;
	  }
	}
	ctx.fillText(line, x, y);
	ctx.textAlign = "center";
}
/********************************************************************************************/

function drawWrapText(image, message, x, y, thisHeight, minusY, height, wrapY){
	ctx.drawImage(image, 0, 0, 262, 94, x - 66, y - thisHeight - minusY, 131, height); 
	if(hasWhiteSpaces(message) == true){
		wrapText(ctx,message,x,y - wrapY, 110, 12);
	}else{
		wrapText(ctx,splitLongText(message),x,y - wrapY, 110, 12);
	}
}

var devCommands = [{command:'/ban', message:'Banning...'}, {command:'/unban', message: 'Unbanning...'}, {command: '/remove', message: 'Removing Player...'}];

function command(command, message){
	let isDevCommand = getElementFromArrayByValue(command, 'command', devCommands);
	if(localPlayer.isDev == true && isDevCommand != false){
		setLocalMessage(isDevCommand.message, true);	//Make the bird say words like Banning...
	}else{
		switch(command){
			case '/room':
				console.warn('This doesn t exist yet');
			break;
		}
	}
	socket.emit(command, message);	//Send command to the server
}

function setLocalMessage(thisMessage, isDevCommand){
	let checkCommand = thisMessage.split(" ");
	if(checkCommand[0].includes("/") == true){	//Check if it's a command
		command(checkCommand[0], thisMessage);
	}else{
		module.dirtyWordsChecker(thisMessage, function(t){	//check if it's a dirty word
			if(t == true){
				localPlayer.message = "🤬";
			}else if(t == false){
				localPlayer.message = thisMessage;
			}
		},'./data/profanity.csv','./data/exceptions.csv');

		if(localPlayer.messageTimeout != undefined){
			clearTimeout(localPlayer.messageTimeout);
			localPlayer.hideBubble();
		}else if(localPlayer.messageTimeout == undefined){
			localPlayer.hideBubble();
		}
		if(isDevCommand == false || isDevCommand == undefined){	//Prevents from the moderators or devs saying, for example, Banning... for everyone
			socket.emit('message', thisMessage);
		}
	}
}