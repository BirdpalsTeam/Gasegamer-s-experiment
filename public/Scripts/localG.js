form = document.getElementById("form");
input = document.getElementById("input");

var room = new Sprite(roomImage, 0, 0, 892, 512, 0, 0, 800, 500, 0, 0);
var details = new Sprite(detailsImage, 0, 0, 892, 512, 0, 0, 800, 500, 0, 0);

var roomCollMapX = 8;
var roomCollMapY = 17;
var roomCollCellWidth = room.width / roomCollMapX;
var roomCollCellHeight = room.height / roomCollMapY;
var roomCollMap = [
	0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 1, 1, 1, 1, 0, 0,
	1, 1, 1, 0, 0, 1, 1, 1,
	1, 0, 0, 0, 0, 0, 0, 1,
	1, 0, 0, 0, 0, 0, 0, 1,
	1, 0, 0, 0, 0, 0, 0, 1,
	1, 0, 0, 0, 0, 0, 0, 1,
	1, 1, 0, 0, 0, 0, 1, 1,
	0, 1, 0, 0, 0, 0, 1, 0,
	0, 1, 1, 1, 1, 1, 1, 0
];

function drawCollisionMap(){	//Just a debug function
	let x, y;
	for(y = 0; y < roomCollMapY; y++){
		for(x = 0; x < roomCollMapX; x++){
			if(roomCollMap[y*roomCollMapX+x] == 1) { ctx.beginPath(); ctx.fillStyle = "red"; ctx.rect(roomCollCellWidth * x, roomCollCellHeight * y, room.width / roomCollMapX, room.height / roomCollMapY); ctx.fill(); }
		}
	}
}

function getMousePos(cv, evt) {
	var rect = cv.getBoundingClientRect();
		return {
			x: evt.clientX - rect.left,
			y: evt.clientY - rect.top
}};

canvas.addEventListener('click', function(evt) {
	mousePos = getMousePos(canvas, evt);
	if(localPlayer != undefined){
		localPlayer.mouseX = mousePos.x;
		localPlayer.mouseY = mousePos.y;
		localPlayer.move();
	}
	const playerMovement = {
		mouseX: mousePos.x,
		mouseY: mousePos.y
	}
	socket.emit('playerMovement', playerMovement);
}, false);

form.addEventListener('submit', function(e) {
	e.preventDefault();
		if (input.value) {	
			setLocalMessage(input.value);
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

	details.draw();
	requestAnimationFrame(render);
}

render();