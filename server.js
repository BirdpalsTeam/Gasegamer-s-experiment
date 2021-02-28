var express = require('express');
var app = express();
var path = require('path');
const { setInterval } = require('timers');
const http = require('http').Server(app);
const io = require('socket.io')(http);

//Send the public files to the domain
app.use(express.static('public'))
app.get('/', function(req, res){
	res.sendFile('index.html');
  }); 

const gameState ={
	players: {}
}

//Websockets communication
io.on('connection', (socket) => {
	var PlayerInterval,waitToDisappear;

	console.log('A user connected: ' + socket.id);

	socket.on('disconnect', function(){
		console.log('A user disconnected: ' + socket.id);
		delete gameState.players[socket.id];
	})

	gameState.players[socket.id] =							//Spawn the player
		{
			id: socket.id,
			x:410,
			y:380,
			width:62,
			height:72,
			isMoving: false,
			mouseX: 416,
			mouseY: 323,
			lastX: 410,
			lastY: 180,
			playerMove: function (move, player){ PlayerInterval = setInterval(move,1000 / 60, player)},	//Creates the player move function inside each player
			message: "",
			bubbleAppear: function(){ waitToDisappear = setTimeout(() => {gameState.players[socket.id].message = ""; clearTimeout(waitToDisappear)}, 10000);}
		}

	socket.on('playerMovement', (playerMovement) =>{

		const player = gameState.players[socket.id]; //Set what player wants to move
		player.lastX = player.x;
		player.lastY = player.y;
			if(player.isMoving == false){
				player.playerMove(move, player);
				
			}else{
				clearInterval(PlayerInterval);
				player.playerMove(move, player);
			}
	
		function move(player){								//Function responsible to move the player
			player.isMoving = true;
				let dx = playerMovement.mouseX - player.x;    //Get the difference x from the player position and the click position
				let dy = playerMovement.mouseY - player.y;

				let angle = Math.atan2(dy, dx);                //Calculates the angle from the difference between the player and the click
		
				var lenght= Math.sqrt(dx*dx + dy * dy);        //Calculates the distance bewtween the player and the click
			
				let speed = 4;
				velX = Math.cos(angle) * speed;                //Calculates the velocityX necessary to the player be at the same position as the click
				velY = Math.sin(angle) * speed;
			
				player.x += velX;                            //Moves the player
				player.y += velY;
				
				if(lenght){
				dx /= lenght;								//Normalize the dx and dy value
				dy/= lenght;
				}
				
				if(lenght >= 0.1 && lenght <= 2){			//Detects if the player reached the click position
					clearInterval(PlayerInterval);
					player.isMoving = false;
				}
				player.mouseX = playerMovement.mouseX;
				player.mouseY = playerMovement.mouseY;
				
		}	//Function end

    })//Player Movement end
	
	socket.on('message',(message)=>{
		gameState.players[socket.id].message = message;
		clearTimeout(waitToDisappear);
		gameState.players[socket.id].bubbleAppear();
	})
}) // io connection end
	
setInterval(()=>{
	io.sockets.emit('state',gameState);				//Emit the gameState to all players online.
}, 1000/60);

//Starts the server on port 3000
http.listen(process.env.PORT || 25565, () => {
	console.log('listening on *:3000');
  });