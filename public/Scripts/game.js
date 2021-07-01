var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

var debugParagraph = document.getElementById('debugParagraph');

var currentState = new WorldState();

var spritesStillLoading = 0;
var loadSprite = function(imageName){
	var image = new Image();
	image.src = imageName;
	spritesStillLoading += 1;
	image.onload = function () {
		spritesStillLoading -= 1;
	};
	return image;
}

var JSONSrc = 'JSONS/';
var spritesSrc = 'Sprites/';
var charactersSrc = spritesSrc + 'characters/';
var roomsSrc = spritesSrc + 'rooms/';
var hudSrc = spritesSrc + 'hud/';

var rooms, currentRoom, triggers;
var birdImage, roomImage, detailsImage, bubble_image;
var collisionArray, predictArray = new Array();
bubble_image = loadSprite(hudSrc + 'hud.png');
birdImage = loadSprite(charactersSrc + 'bird_blue.png');
detailsImage = loadSprite(roomsSrc + 'town_details.png');
customGetJSON(JSONSrc + 'roomsJSON.json').then(response =>{
	rooms = response;
	currentRoom = rooms.town.name;
	roomImage = loadSprite(roomsSrc + rooms.town.image);
	roomCollision();
	assetLoadingLoop(); //Will only start when it get's the rooms image
})
var f = [] // debug array
//Room stuff
var roomCollMapX, roomCollMapY, roomCollCellWidth,roomCollCellHeight, roomCollMap;
function roomCollision(){
	f=[];
	roomCollMapX = rooms[currentRoom].roomCollMapX;
	roomCollMapY = rooms[currentRoom].roomCollMapY;
	roomCollCellWidth = 1000 / roomCollMapX;
	roomCollCellHeight = 600 / roomCollMapY;
	roomCollMap = rooms[currentRoom].roomCollMap;
	triggers = rooms[currentRoom].triggers;
	predictArray = rooms[currentRoom].noCollidersArea;
	/*for(y = 0; y < roomCollMapY; y++){
		for(x = 0; x < roomCollMapX; x++){
			if(roomCollMap[y*roomCollMapX+x] == 1){
				f.push(roomCollCellWidth * x, roomCollCellHeight * y);
				console.log(f)
			}
			
		}
	}*/
	
	collisionArray = rooms[currentRoom].collision;
}
//Trigger Stuff
function activateTrigger(triggerArray){
	switch(triggerArray[4]){
		case "changeRoom":
			setLocalMessage("/room " + triggerArray[5]);
			break;
	}
}
// Create a script tag
var script = document.createElement('script');

// Assign a URL to the script element
script.src = 'Scripts/localG.js';

var ready = false;
var ticket = sessionStorage.getItem('ticket');
var playerId = sessionStorage.getItem('playerId');
var mousePos, click, localPlayer;
var id = 'id';

var playersInGame = new Array();
var playersObject = new Array();

if(ticket == null){
	window.location.href = 'index.html';
}
var socket = io();

socket.on('disconnect', () => {
	alert('You lost connection.');
	window.location.href = "index.html";
});

socket.on('verificationStatus', () => {
	alert('You are not verified! Please check your e-mail to verify your account.');
	window.location.href = "index.html";
});

socket.on('youAreBanned', () =>{
	alert('Sorry, but you are banned.');
	window.location.href = "index.html";
})

socket.on('alreadyLoggedIn', () => {
	alert('You are already logged in! Please enter with another account or try to login again.');
	window.location.href = "index.html";
});

socket.on('loggedOut', () =>{
	window.location.href = "index.html";
})

socket.emit('login',ticket);

socket.on('readyToPlay?', () =>{	//Server is asking if the player can be added on the client
	ready = true;
});

function assetLoadingLoop(){
	if (spritesStillLoading > 0){	//If all images are not loaded
		window.setTimeout(assetLoadingLoop, 1000 / 60);
	}
	else{
		if(ready == true){	//If the Classes.js script is ready and the server said we can continue
			socket.emit('Im Ready');
		}else{
			window.setTimeout(assetLoadingLoop, 1000 / 60); 
		}
	}	
}

socket.on('loggedIn', (players) =>{	//Server response to "Im Ready";
	players.forEach(player => {
		if(player.id == playerId && localPlayer == undefined){
			localPlayer = new Player(birdImage, 37, 175, 110, 154, player.x, player.y, player.width, player.height, 31, 67, bubble_image, player.id, player.username, player.isMoving, player.mouseX, player.mouseY, player.isDev, player.items);
		} 
		else if(player.id != playerId && !checkIfElementIsInArray(player, 'id',playersInGame)){	
			playersInGame.push(player); 
			let tempPlayer = new Player(birdImage, 37, 175, 110, 154, player.x, player.y, player.width, player.height, 31, 67, bubble_image, player.id, player.username, player.isMoving, player.mouseX, player.mouseY, player.isDev, player.items);
			tempPlayer.items.forEach(item=>{
				tempPlayer.addItem(item.ItemClass, item.ItemId);
			})
			playersObject.push(tempPlayer);
			delete tempPlayer;
		}
	});
	let ref = document.getElementById('Classes');
	ref.appendChild(script);		//Add index.js
})

socket.on('newPlayer', (player) => {
	playersInGame.push(player); 
	let tempPlayer = new Player(birdImage, 37, 175, 110, 154, player.x, player.y, player.width, player.height, 31, 67, bubble_image, player.id, player.username, player.isMoving, player.mouseX, player.mouseY, player.isDev, player.items);
	tempPlayer.items.forEach(item =>{
		tempPlayer.addItem(item.ItemClass, item.ItemId);
	})
	playersObject.push(tempPlayer);
	delete tempPlayer;
});

socket.on('byePlayer', (playerThatLeft) =>{
	let playerO = getElementFromArray(playerThatLeft, id, playersObject);
	let playerG = getElementFromArray(playerThatLeft, id, playersInGame);

	playersInGame.splice(playersInGame.indexOf(playerG), 1);
	playersObject.splice(playersObject.indexOf(playerO), 1);
});

socket.on('playerIsMoving', (player) =>{
	let playerO = getElementFromArray(player, id, playersObject);

	playerO.mouseX = player.mouseX;
	playerO.mouseY = player.mouseY
	playerO.move();
})

socket.on('playerSaid', (player) => {
	let playerO = getElementFromArray(player, id, playersObject);

	playerO.message = player.message;

	if(playerO.messageTimeout != undefined){
		clearTimeout(playerO.messageTimeout);
		playerO.hideBubble();
	}else{
		playerO.hideBubble();
	}
});
socket.on('badWord', (message) =>{
	setLocalMessage(message, true);
})
socket.on('joinRoom', (joinRoom) =>{
	clearInterval(localPlayer.movePlayerInterval)
	roomSprite.img = loadSprite(roomsSrc+ rooms[joinRoom.name].image);
	details.img = loadSprite(roomsSrc + rooms[joinRoom.name].details.image);
	currentRoom = joinRoom.name;
	switch(joinRoom.name){
		case "town":
			document.getElementById('background_music').src = 'Audio/Alpha_Party.mp3';
			break;
		case "cabin":
			document.getElementById('background_music').src = 'Audio/Cabin.mp3';
			break;
	}
	localPlayer.x = joinRoom.posX;
	localPlayer.y = joinRoom.posY;
	localPlayer.itemsImgs.forEach(item => {
		item.x = joinRoom.posX;
		item.y = joinRoom.posY;
	});
	roomCollision();
})
socket.on('leaveRoom', () => {
	playersInGame = [];
	playersObject = [];
})
socket.on('playerBanned!', () =>{
	setLocalMessage('Successfully Banned :)', true);
})

socket.on('playerUnbanned!', () =>{
	setLocalMessage('Successfully UnBanned :)', true);
})