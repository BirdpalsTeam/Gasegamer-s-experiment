var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

var debugParagraph = document.getElementById('debugParagraph');
var bioInput = document.getElementById('bioInput');

var currentState = new WorldState();

var caslonFont = new FontFace('Caslon', 'url(./CaslonAntique-BoldItalic.ttf)');
caslonFont.load().then(function(font){
	console.log(font)
	document.fonts.add(font);
  }).catch((error) =>{
	  console.log(error)
  });

var canvasTxt = window.canvasTxt.default;

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
var itemsSrc = spritesSrc + 'items/';

var rooms, currentRoom, triggers;
var birdImage, roomImage, foregroundImage, bubble_image, inventoryImage;
var collisionArray, predictArray = new Array();

bubble_image = loadSprite(hudSrc + 'hud.png');
birdImage = loadSprite(charactersSrc + 'bird_blue.png');
foregroundImage = loadSprite(roomsSrc + 'town/town_foreground.png');
inventoryImage = loadSprite(hudSrc + 'inventory2.png');

var roomObjects = [];

customGetJSON(JSONSrc + 'roomsJSON.json').then(response =>{
	rooms = response;
	currentRoom = rooms.town.name;
	roomImage = loadSprite(roomsSrc + rooms.town.images.background);
	assetLoadingLoop(); //Will only start when it gets the rooms json
	roomCollision();
	getRoomObjects("town");
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
	
	for(y = 0; y < roomCollMapY; y++){
		for(x = 0; x < roomCollMapX; x++){
			if(roomCollMap[y*roomCollMapX+x] == 1){
				f.push(roomCollCellWidth * x, roomCollCellHeight * y);
			}
			
		}
	}
	
	collisionArray = f;
}
function getRoomObjects(roomname){
	roomObjects = [];
	let objectsImageSrc = roomsSrc + rooms[roomname].images.details;
	let objectsImage = new Image();
	objectsImage.src = objectsImageSrc;
	let objectDimensions = rooms[roomname].objects;
	for(let i = 0; i<rooms[roomname].objects.length; i++){
		roomObjects.push(new Sprite(objectsImage, objectDimensions[i][0],objectDimensions[i][1],objectDimensions[i][2],objectDimensions[i][3],objectDimensions[i][0]+objectDimensions[i][4],objectDimensions[i][1]+objectDimensions[i][5],objectDimensions[i][2],objectDimensions[i][3],objectDimensions[i][4],objectDimensions[i][5]));
	}
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
var mousePos, mouseOver, localPlayer;
mousePos = {x: 0, y: 0};
mouseOver = {x: 0, y: 0};
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

socket.on('error', (error) =>{
	alert(error);
	window.location.href = "index.html";
})

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
			localPlayer = new Player(player);
		} 
		else if(player.id != playerId && !checkIfElementIsInArray(player, 'id', playersInGame)){	
			playersInGame.push(player); 
			let tempPlayer = new Player(player);
			tempPlayer.items.forEach(item=>{
				tempPlayer.addItem(item.ItemClass, item.ItemId);
			})
			playersObject.push(tempPlayer);
			delete tempPlayer;
		}
	});
	let ref = document.getElementById('Game');
	ref.appendChild(script);		//Add index.js
})

socket.on('newPlayer', (player) => {
	playersInGame.push(player); 
	let tempPlayer = new Player(player);
	tempPlayer.items.forEach(item =>{
		tempPlayer.addItem(item.ItemClass, item.ItemId);
	})
	playersObject.push(tempPlayer);
	delete tempPlayer;
});

socket.on('byePlayer', (playerThatLeft) =>{
	let playerO = getElementFromArray(playerThatLeft, id, playersObject);
	let playerG = getElementFromArray(playerThatLeft, id, playersInGame);
	if(playerO.card.isOpen == true){
		playerO.card.close();
		localPlayer.canMove = true;
	}
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
	roomSprite.img = loadSprite(roomsSrc + rooms[joinRoom.name].images.background);
	foreground.img = loadSprite(roomsSrc + rooms[joinRoom.name].images.foreground);
	changeRoomWidthAndHeight(roomSprite, joinRoom.name);
	changeRoomWidthAndHeight(foreground, joinRoom.name);
	currentRoom = joinRoom.name;
	let background_music = document.getElementById('background_music');
	switch(joinRoom.name){
		case "town":
			background_music.src = 'Audio/Alpha_Party.mp3';
			break;
		case "cabin":
			background_music.src = 'Audio/Cabin.mp3';
			break;
	}
	localPlayer.x = joinRoom.posX;
	localPlayer.y = joinRoom.posY;
	localPlayer.itemsImgs.forEach(item => {
		item.x = joinRoom.posX;
		item.y = joinRoom.posY;
	});
	getRoomObjects(joinRoom.name);
	roomCollision();
})
function changeRoomWidthAndHeight(room, roomname){
	room.width = rooms[roomname].size.width;
	room.height = rooms[roomname].size.height;
	room.sourceWidth = rooms[roomname].size.width;
	room.sourceHeight = rooms[roomname].size.height;
}
socket.on('leaveRoom', () => {
	playersInGame = [];
	playersObject = [];
})

socket.on('playerUpdatedGear', (message) =>{
	let player = getElementFromArrayByValue(message.player, id, playersObject);
	player.items = message.gear;
	player.itemsImgs = new Array();
	let colors = false;
	player.items.forEach((item) =>{
		player.addItem(item.ItemClass, item.ItemId);
		if(item.ItemClass == 'color'){
			colors = true;
		}
	})
	if(colors == false){
		let tempCharacterImg = new Image();
		tempCharacterImg.src = charactersSrc + "bird_blue.png";
		player.img = tempCharacterImg;
		player.img.name = 'bird_blue';
	}
})

socket.on('changingInventory', (message) =>{
	setTimeout(() => {
		inventory.isChanging = message;
	}, 5000);
})

socket.on('changedBio', (newBio) =>{
	let player = getElementFromArrayByValue(newBio.player, id, playersObject);
	player.card.bio = newBio.newBio;
})

socket.on('playerBanned!', () =>{
	setLocalMessage('Successfully Banned :)', true);
})

socket.on('playerUnbanned!', () =>{
	setLocalMessage('Successfully UnBanned :)', true);
})