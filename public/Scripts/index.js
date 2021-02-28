var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

var socket = io();

var birdImage = new Image();
birdImage.src = 'Sprites/characters/bird_blue.png';
var roomImage = new Image();
roomImage.src = 'Sprites/rooms/town.png';
var bubble_image = new Image();
bubble_image.src = 'Sprites/hud/hud.png';

form = document.getElementById("form");
input = document.getElementById("input");

var mousePos, click, localPlayer,otherPlayers, messageText;

socket.on('state', (gameState) => {									//Receive the gameState from the server
	ctx.clearRect(0,0,canvas.width, canvas.height);					//Clears the Canvas before draw the player
	room = new GameObject(0,roomImage, 0, 0, 892, 512, 0, 0, 800, 500, 0, 0);
	room.drawRoom();
	Players = Object.values(gameState.players);
	Players.forEach(element => {
		if(element.id == socket.id){
			localPlayer = element;
			localPlayer = new GameObject(element.id,birdImage,144,0,144,172,element.x,element.y,element.width,element.height,31,67, element.mouseX, element.mouseY, element.lastX, element.lastY, element.message);
			localPlayer.drawPlayer();
		}else{
			otherPlayers = new GameObject(element.id,birdImage,144,0,144,172,element.x,element.y,element.width,element.height,31,67, element.mouseX, element.mouseY, element.lastX, element.lastY, element.message);
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
		const playerMovement = {
			mouseX: mousePos.x,
			mouseY: mousePos.y
		}
	click = true;
	socket.emit('playerMovement', playerMovement);
}, false);

form.addEventListener('submit', function(e) {
	e.preventDefault();
		if (input.value) {
			socket.emit('message', input.value);
			input.value = '';
		}
});