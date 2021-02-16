var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

var socket = io();
var localGameState;

var started = false;

socket.emit('newPlayer'); //Say to the server that you are a new player



const drawPlayers = (players) => {									//Draw players except you.
	if(players.id != socket.id){
	ctx.beginPath();
	ctx.rect(players.x, players.y, players.width, players.height);
	ctx.fillStyle = '#0095DD';
	ctx.fill();
	}
};
const drawPlayer = (player) => {									//Draw you.
	if(player.id = socket.id){
	ctx.beginPath();
	ctx.rect(player.x, player.y, player.width, player.height);
	ctx.fillStyle = '#0095DD';
	ctx.fill();

	}
}
socket.on('state', (gameState) => {									//Receive the gameState from the server
	ctx.clearRect(0,0,canvas.width, canvas.height);
	for(let player in gameState.players){
		drawPlayers(gameState.players[player]);	
		drawPlayer(gameState.players[player]);
	}

});

 function getMousePos(cv, evt) {
        var rect = cv.getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        }};

canvas.addEventListener('click', function(evt) {
	var mousePos = getMousePos(canvas, evt);

	const playerMovement ={
		mouseX: mousePos.x,
		mouseY: mousePos.y
	}
	socket.emit('playerMovement', playerMovement);

	
		
}, false);

