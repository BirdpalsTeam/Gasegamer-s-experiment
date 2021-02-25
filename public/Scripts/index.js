var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

var socket = io();
var birdImage = new Image();
birdImage.src = 'Sprites/characters/bird_blue.png';
var roomImage = new Image();
roomImage.src = 'Sprites/rooms/town.png';
var mousePos;

const drawPlayers = (players) => {									//Draw players except you.
	if(players.id != socket.id){
		players = new GameObject(birdImage,144,0,144,172,players.x, players.y, players.width, players.height,31,67);
		players.drawPlayer();
	}
}
const drawPlayer = (player) => {									//Draws you.
	player.drawPlayer();
}
socket.on('state', (gameState) => {									//Receive the gameState from the server
	ctx.clearRect(0,0,canvas.width, canvas.height);					//Clears the Canvas before draw the player
	room = new GameObject(roomImage, 0, 0, 892, 512, 0, 0, 800, 500, 0, 0);
	room.drawRoom();
	
	for(let player in gameState.players){
		localPlayer = gameState.players[player];
		localPlayerObject =  new GameObject(birdImage,144,0,144,172,localPlayer.x, localPlayer.y, localPlayer.width, localPlayer.height, 31, 67);
		drawPlayers(gameState.players[player]);	
		
		drawPlayer(localPlayerObject);
	}
	

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
socket.emit('playerMovement', playerMovement);
}, false);