var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

var loadSprite, spritesStillLoading = 0;
loadSprite = function(imageName){
	var image = new Image();
	image.src = imageName;
	spritesStillLoading += 1;
	image.onload = function () {
		spritesStillLoading -= 1;
	};
	return image;
}

var spritesSrc = 'Sprites/';
var charactersSrc = spritesSrc + 'characters/';
var roomsSrc = spritesSrc + 'rooms/';
var hudSrc = spritesSrc + 'hud/'

var birdImage = loadSprite(charactersSrc + 'bird_blue.png');

var roomImage = loadSprite(roomsSrc + 'town.png');

var cake_image = roomImage;

var trees_image = roomImage;

var bubble_image = loadSprite(hudSrc + 'hud.png');

// Create a script tag
var script = document.createElement('script');

// Assign a URL to the script element
script.src = 'Scripts/index.js';

var ref;
var ready = false;
var ticket = sessionStorage.getItem('ticket');
var playerId = sessionStorage.getItem('playerId');
var mousePos, click, localPlayer;
var id = 'id';
var playersInGame = new Array();
var playersObject = new Array();

var socket = io();

socket.on('verificationStatus', () => {
	alert('You are not verified! Please check your e-mail to verify your account.');
		window.location.href = "index.html";
});

socket.on('alreadyLoggedIn', () => {
	alert('You are already logged in! Please enter with another account.');
	window.location.href = "index.html";
});

socket.emit('login',ticket);

socket.on('readyToPlay?', () =>{	//Server is asking if the player can be added on the client
	ready = true;
});
// Get the first script tag on the page (we'll insert our new one before it)
function assetLoadingLoop(){
	ref = document.getElementById('Classes');
	if (spritesStillLoading > 0){	//If all images are not loaded
		window.setTimeout(assetLoadingLoop, 1000 / 60);
	}
	else{
		if(ref != null && ready == true){	//If the Classes.js script is ready and the server said we can continue
			socket.emit('Im Ready');
		}else{
			window.setTimeout(assetLoadingLoop, 1000 / 60); 
		}
	}	
}

socket.on('loggedIn', (players) =>{	//When you first log in
	players.forEach(player => {
		if(player.id == playerId && localPlayer == undefined){
			localPlayer = new Player(birdImage, 144, 0, 144, 170, player.x, player.y, player.width, player.height, 31, 67, bubble_image, player.id, player.username, player.isMoving, player.mouseX, player.mouseY);
		} 
		else if(player.id != playerId && !checkIfElementIsInArray(player, 'id',playersInGame)){	
				playersInGame.push(player); 
				let tempPlayer = new Player(birdImage, 144, 0, 144, 172, player.x, player.y, player.width, player.height, 31, 67, bubble_image, player.id, player.username, player.isMoving, player.mouseX, player.mouseY);
				playersObject.push(tempPlayer);
				delete tempPlayer;
		}	
		ref.appendChild(script);		//Add index.js
	});
})

assetLoadingLoop(); //First initalization