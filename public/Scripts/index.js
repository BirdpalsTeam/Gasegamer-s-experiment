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

var mousePos, click, localPlayer, playersObject;
playerId = sessionStorage.getItem('playerId');

var playersInGame = new Array();
playersObject = new Array();

var room = new Sprite(roomImage, 0, 0, 892, 512, 0, 0, 800, 500, 0, 0);

socket.on('newPlayer', (players) => {									//Receive the gameState from the server
	players.forEach(player => {
		if(player.id == playerId && localPlayer == undefined){
			localPlayer = new Player(birdImage, 144, 0, 144, 172, player.x, player.y, player.width, player.height, 31, 67, bubble_image, player.id, player.socket,player.username, player.isMoving, player.mouseX, player.mouseY);
		} 
		else if(player.id != playerId && !checkIfPlayerIsInGame(player)){	
				playersInGame.push(player); 
				let tempPlayer = new Player(birdImage, 144, 0, 144, 172, player.x, player.y, player.width, player.height, 31, 67, bubble_image, player.id, player.socket,player.username, player.isMoving, player.mouseX, player.mouseY);
				playersObject.push(tempPlayer);
				delete tempPlayer;
		}
	});
});

socket.on('byePlayer', (playerThatLeft) =>{
	playersInGame.forEach(player =>{
		if(playerThatLeft.id == player.id){
			playersInGame.splice(playersInGame.indexOf(player), 1);
			playersObject.splice(playersObject.indexOf(player), 1);
		}
	})
});

socket.on('playerIsMoving', (player) =>{
	for(i = 0; i < playersObject.length; i++){
		if(playersObject[i].socket == player.socket){
			playersObject[i].mouseX = player.mouseX;
			playersObject[i].mouseY = player.mouseY;
			playersObject[i].move();
		}
	}
})

socket.on('playerSaid', (player) => {
	for(i = 0; i < playersObject.length; i++){
		if(playersObject[i].socket == player.socket){
			playersObject[i].message = player.message;
			if(playersObject[i].messageTimeout != undefined){
				clearTimeout(playersObject[i].messageTimeout);
				playersObject[i].hideBubble();
			}else{
				playersObject[i].hideBubble();
			}
		}
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
	localPlayer.mouseX = mousePos.x;
	localPlayer.mouseY = mousePos.y;
	localPlayer.move();
		const playerMovement = {
			mouseX: mousePos.x,
			mouseY: mousePos.y
		}
	socket.emit('playerMovement', playerMovement);
}, false);

form.addEventListener('submit', function(e) {
	e.preventDefault();
		if (input.value) {
			module.dirtyWordsChecker(input.value, function(t){
				if(t == true){
					localPlayer.message = "🤬";
				}else{
					localPlayer.message = input.value;
				}
			},'./data/profanity.csv','./data/exceptions.csv')
			
			if(localPlayer.messageTimeout != undefined){
				clearTimeout(localPlayer.messageTimeout);
				localPlayer.hideBubble();
			}else{
				localPlayer.hideBubble();
			}
			socket.emit('message', input.value);
			input.value = '';
		}
});

function render(){
	ctx.clearRect(0,0,canvas.width,canvas.height);
	room.draw();
	if(localPlayer != undefined){
		localPlayer.draw();
		localPlayer.drawUsername();
		if(localPlayer.message != undefined){
			localPlayer.drawBubble();
		}
	}
	if(playersObject.length > 0){
		playersObject.forEach((player) => {
			player.draw();
			player.drawUsername();
			player.whereToLook();
			if(player.message != undefined){
				player.drawBubble();
			}
		})
	}

	requestAnimationFrame(render);
}
function checkIfPlayerIsInGame(player){
	for(var i = 0; i < playersInGame.length; i++){
		if(playersInGame[i].id == player.id){
			return true;
		}
	}
}
render();