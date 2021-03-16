var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

var playerId, ticket;

var socket = io();
ticket = sessionStorage.getItem('ticket');
socket.emit('login',ticket);


var birdImage = new Image();
birdImage.src = 'Sprites/characters/bird_blue.png';

var roomImage = new Image();
roomImage.src = 'Sprites/rooms/town.png';

var cakeImage = new Image();
cakeImage.src = 'Sprites/rooms/town.png';

var trees_image = new Image();
trees_image.src = 'Sprites/rooms/town.png';

var bubble_image = new Image();
bubble_image.src = 'Sprites/hud/hud.png';

form = document.getElementById("form");
input = document.getElementById("input");

var mousePos, click, localPlayer,otherPlayers, messageText;
playerId = sessionStorage.getItem('playerId');

socket.on('state', (gameState) => {									//Receive the gameState from the server
	getPlayers(gameState);
	/*
	ctx.clearRect(0,0,canvas.width, canvas.height);					//Clears the Canvas before draw the player
	room = new GameObject(0,roomImage, 0, 0, 892, 512, 0, 0, 800, 500);
	cake = new GameObject(0,cakeImage, 1655, 0, 192, 216, 398, 192, 192, 216);
	trees = new GameObject(0,trees_image, 892, 0, 763, 438, 0, 0, 800, 500);
	room.drawRoom();
	Players = Object.values(gameState.players); //Creates an array that contains all players
	Players.forEach(element => {
		if(element.id == playerId){		//detect which player is you
			localPlayer = element;
			localPlayer = new GameObject(element.id,birdImage,144,0,144,172,element.x,element.y,element.width,element.height,31,67, element.mouseX, element.mouseY, element.lastX, element.lastY, element.message, element.name);
			localPlayer.drawPlayer();
		}else{
			otherPlayers = new GameObject(element.id,birdImage,144,0,144,172,element.x,element.y,element.width,element.height,31,67, element.mouseX, element.mouseY, element.lastX, element.lastY, element.message, element.name);
			otherPlayers.drawPlayer();
		}
	});
	cake.drawRoom();
	trees.drawRoom();
	*/
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


let playersInGame = new Array();

let room = new Sprite(roomImage, 0, 0, 892, 512, 0, 0, 800, 500, 0, 0);

function main(){
	setTimeout(main, 5);
}

function render(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	room.draw();

	playersInGame.forEach(currentPlayer => {
		currentPlayer.drawPlayer();
	});

	setTimeout(render, 5);
}


function getPlayers(gameState){
	players = Object.values(gameState.players); //Creates an array that contains all players
	for(let i = 0; i < players; i++){
		if(players[i].id != playerId){
			for(let p = 0; p < playersInGame; p++){		//Note that I'm only setting the players to the GameObject class temporarily, they will be the Player class in future
				if(players[i].id == playersInGame[p].id){
					tempPlayer = new GameObject(element.id,birdImage,144,0,144,172,element.x,element.y,element.width,element.height,31,67, element.mouseX, element.mouseY, element.lastX, element.lastY, element.message, element.name);
					playersInGame[p] = players[i];
				}
				if(players[i] > playersInGame.length){
					playersInGame.push(players[i]);
				}
			}
		}
		else{
			localPlayer = new GameObject(element.id,birdImage,144,0,144,172,element.x,element.y,element.width,element.height,31,67, element.mouseX, element.mouseY, element.lastX, element.lastY, element.message, element.name);
			localPlayer.drawPlayer();
		}
	}
}



main();
render();