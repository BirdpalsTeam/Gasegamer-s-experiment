var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

var socket = io();
var birdImage = new Image();
birdImage.src = 'Sprites/characters/bird_blue.png';
var roomImage = new Image();
roomImage.src = 'Sprites/rooms/town.png';
var mousePos, click, localPlayer,otherPlayers;

socket.on('state', (gameState) => {									//Receive the gameState from the server
	ctx.clearRect(0,0,canvas.width, canvas.height);					//Clears the Canvas before draw the player
	room = new GameObject(roomImage, 0, 0, 892, 512, 0, 0, 800, 500, 0, 0);
	room.drawRoom();
	Players = Object.values(gameState.players);
	Players.forEach(element => {
		if(element.id == socket.id){
			localPlayer = element;
			localPlayer = new GameObject(birdImage,144,0,144,172,element.x,element.y,element.width,element.height,31,67,element.id, element.mouseX, element.mouseY, element.lastX, element.lastY);
			localPlayer.drawPlayer();
		}else{
			otherPlayers = new GameObject(birdImage,144,0,144,172,element.x,element.y,element.width,element.height,31,67,element.id, element.mouseX, element.mouseY, element.lastX, element.lastY);
			otherPlayers.drawPlayer();
		}
	});
	
});


function getMousePos(cv, evt) {
	var rect = cv.getBoundingClientRect();

	return {
	  x: evt.clientX - rect.left,
	  y: evt.clientY - rect.top
	}};

canvas.addEventListener('click', function(evt) {

mousePos = getMousePos(canvas, evt);

const playerMovement ={
	mouseX: mousePos.x,
	mouseY: mousePos.y
}
click = true;

socket.emit('playerMovement', playerMovement);
}, false);