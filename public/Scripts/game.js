var canvas = document.getElementById('objects');
var ctx = canvas.getContext('2d');
var bg_canvas = document.getElementById('background');
var bg_ctx = bg_canvas.getContext('2d');
var fg_canvas = document.getElementById('foreground');
var fg_ctx = fg_canvas.getContext('2d');
var txt_canvas = document.getElementById('txt_canvas');
var txt_ctx = txt_canvas.getContext('2d');
txt_ctx.imageSmoothingEnabled = false;
var ui_canvas = document.getElementById('ui_canvas');
var ui_ctx = ui_canvas.getContext('2d');

var loading_screen = document.getElementById('loading');

var debugParagraph = document.getElementById('debugParagraph');
var bioInput = document.getElementById('bioInput');

var background_music = document.getElementById('background_music');

var chatbox = document.getElementById("chatbox");

var reportDiv = document.getElementById("reportDiv");
var reportInput = document.getElementById("reportInput");
var reportingDiv = document.getElementById("reportingDiv");
var submittedDiv = document.getElementById("submittedDiv");

var currentState = new WorldState();

var caslonFont = new FontFace('Caslon', 'url(Fonts/CaslonAntique-BoldItalic.ttf)');
caslonFont.load().then(function(font){
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
var audioSrc = 'Audio/';

var rooms, currentRoom, triggers;
var birdImage, roomImage, foregroundImage, bubble_image, inventoryImage;
var collisionArray, predictArray = new Array();

bubble_image = loadSprite(hudSrc + 'hud.png');
birdImage = loadSprite(charactersSrc + 'bird_blue.png');
foregroundImage = loadSprite(roomsSrc + 'town/town_foreground.png');
inventoryImage = loadSprite(hudSrc + 'inventory2.png');

var birdSize = {width:82, height:110};

var roomObjects = [];
var roomNPCs = [];

customGetJSON(JSONSrc + 'roomsJSON.json').then(response =>{
	rooms = response;
	currentRoom = rooms.town.name;
	roomImage = loadSprite(roomsSrc + rooms.town.images.background);
	assetLoadingLoop(); //Will only start when it gets the rooms json
	roomCollision();
	getRoomObjects("town");
	getNPCs("town");
	changeMusicByRoom("town");
	changeBirdSize("town");
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
	if(rooms[roomname].objects != undefined){
		let objectsImageSrc = roomsSrc + rooms[roomname].images.details;
		let objectsImage = new Image();
		objectsImage.src = objectsImageSrc;
		let objectDimensions = rooms[roomname].objects;
		for(let i = 0; i<rooms[roomname].objects.length; i++){
			roomObjects.push(new Sprite(objectsImage, objectDimensions[i][0],objectDimensions[i][1],objectDimensions[i][2],objectDimensions[i][3],objectDimensions[i][0]+objectDimensions[i][4],objectDimensions[i][1]+objectDimensions[i][5],objectDimensions[i][2],objectDimensions[i][3],objectDimensions[i][4],objectDimensions[i][5]));
		}
	}
}
function getNPCs(roomname){
	roomNPCs = [];

	if(rooms[roomname].NPCs != undefined){
		for(let i = 0; i<rooms[roomname].NPCs.length; i++){
			let npcdetails = rooms[roomname].NPCs[i]
			let npcimgsrc = spritesSrc + npcdetails[0];
			let npcimg = new Image();
			npcimg.src = npcimgsrc;
			roomNPCs.push(new NPC(npcimg, npcdetails[2][0], npcdetails[2][1], npcdetails[2][2], npcdetails[2][3], npcdetails[3][0], npcdetails[3][1], npcdetails[3][2], npcdetails[3][3], npcdetails[4][0], npcdetails[4][1], npcdetails[1]));
		}
	}
}

function changeBirdSize(roomname){
	birdSize.width = rooms[roomname].birdSize.width;
	birdSize.height = rooms[roomname].birdSize.height;
}

var currentMusicSrc = "";

function changeMusicByRoom(roomName){
	if(currentMusicSrc != audioSrc + rooms[roomName].music){
		background_music.src = audioSrc + rooms[roomName].music;
		currentMusicSrc = audioSrc + rooms[roomName].music;
	}
}
function changeMusicBySrc(src){
	if(currentMusicSrc != audioSrc + src){
		background_music.src = audioSrc + src;
		currentMusicSrc = audioSrc + src;
	}
}
function stopMusic(){
	background_music.pause();
	background_music.currentTime = 0;
}
//Trigger Stuff
function activateTrigger(triggerArray){
	switch(triggerArray[4]){
		case "changeRoom":
			setLocalMessage("/room " + triggerArray[5]);
			break;
		case "getFreeItem":
			socket.emit("getFreeItem", triggerArray[5]);
			break;
	}
}

function changeRoomWidthAndHeight(room, roomname){
	room.width = rooms[roomname].size.width;
	room.height = rooms[roomname].size.height;
	room.sourceWidth = rooms[roomname].size.width;
	room.sourceHeight = rooms[roomname].size.height;
	room.draw();
	console.log(rooms[roomname].size.width);
	console.log(rooms[roomname].size.height);
}

function loadRoom(joinRoom){
	if(spritesStillLoading > 0){
		loading_screen.hidden = false;
		window.setTimeout(loadRoom, 1000 / 60, joinRoom);
	}else{
		changeRoomWidthAndHeight(roomSprite, joinRoom.name);
		changeRoomWidthAndHeight(foreground, joinRoom.name);
		currentRoom = joinRoom.name;
		changeMusicByRoom(joinRoom.name);
		localPlayer.x = joinRoom.posX;
		localPlayer.y = joinRoom.posY;
		localPlayer.itemsImgs.forEach(item => {
			item.x = joinRoom.posX;
			item.y = joinRoom.posY;
		});
		getRoomObjects(joinRoom.name);
		getNPCs(joinRoom.name);
		roomCollision();
		changeBirdSize(joinRoom.name);
		loading_screen.hidden = true;
	}
}

function addToChatbox(chatboxtext){
	chatbox.innerHTML = chatbox.innerHTML + "<p class='chatboxText'>"+chatboxtext+"</p>";
	chatbox.scrollTop = chatbox.scrollHeight;
}
function toggleChatbox(){
	if(chatbox.hidden == true){
		chatbox.hidden = false;
	}
	else{
		chatbox.hidden = true;
	}
}
var chatboxOpenBeforeInventory = true;
function inventoryChatboxCheck(){
	
}

var playerToReport = "";
function openReport(playername){
	playerToReport = playername;
	reportInput.value = "";
	reportDiv.hidden = false;
	reportingDiv.hidden = false;
	submittedDiv.hidden = true;
}
function closeReport(){
	reportDiv.hidden = true;
}
function submitReport(playername, reason){
	socket.emit('/report', "/report "+playername+" "+reason);
	reportingDiv.hidden = true;
	submittedDiv.hidden = false;
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

socket.on('errors', (error) =>{
	alert(error);
	window.location.href = "index.html";
})

socket.on('loggedOut', () =>{
	window.location.href = "index.html";
})

socket.emit('login', ticket);

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
	ref.appendChild(script);		//Add localG.js
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

	addToChatbox(playerO.username+": "+playerO.message);
});

socket.on('badWord', (message) =>{
	setLocalMessage(message, true);
})

socket.on('joinRoom', (joinRoom) =>{
	clearInterval(localPlayer.movePlayerInterval);
	roomSprite.img = loadSprite(roomsSrc + rooms[joinRoom.name].images.background);
	foreground.img = loadSprite(roomsSrc + rooms[joinRoom.name].images.foreground);
	loadRoom(joinRoom);
})

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

console.log("%cATTENTION!","color: #FF2D00; font-family:sans-serif; font-size: 45px; font-weight: 900; text-shadow: #000 3px 3px 3px");
console.log(`%cIf someone told you to copy/paste here, DON'T DO IT!`,"color: #F8FF00; font-family:sans-serif; font-size: 18px; font-weight: 900; text-shadow: #000 2px 2px 3px");
console.log(`%cThey might be trying to STEAL YOUR ACCOUNT!`,"color: #FCE92F; font-family:sans-serif; font-size: 14px; font-weight: 900; text-shadow: #000 2px 2px 2px")