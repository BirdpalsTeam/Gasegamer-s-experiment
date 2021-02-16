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
	console.log('A user connected: ' + socket.id);

	socket.on('disconnect', function(){
		console.log('A user disconnected: ' + socket.id);
		delete gameState.players[socket.id];

	})
var intervalo;
	socket.on('newPlayer', () =>{
		gameState.players[socket.id] =
		{
			id: socket.id,
			x:250,
			y:250,
			width:50,
			height:50,
			isMoving: false,
			playerMove: function (move, player){ intervalo = setInterval(move,1000 / 60, player)}
		}
	})
	
	socket.on('playerMovement', (playerMovement) =>{

		const player = gameState.players[socket.id]; //Sets what player wants to move
		
		player.move = function (player){

			if(player.isMoving == false){
				player.playerMove(move, player);
				
			}else{
				clearInterval(intervalo);
				player.playerMove(move, player);
			}
			

		}// End of the function
	
		function move(player){
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
				dx /= lenght;
				dy/= lenght;
				}
			
				if(lenght >= 0.1 && lenght <= 2){
					clearInterval(intervalo);
					player.isMoving = false;
				}
				
		}	//Function end
	
		player.move(player);

    })//Player Movement end
	
}) // io connection end
	
setInterval(()=>{
	io.sockets.emit('state',gameState);				//Emit the gameState to all players online.
}, 1000/60);

//Starts the server on port 3000
http.listen(process.env.PORT || 25565, () => {
	console.log('listening on *:3000');
  });