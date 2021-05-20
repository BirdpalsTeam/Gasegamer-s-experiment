form = document.getElementById("form");
input = document.getElementById("input");

let timeScale = 1;

var roomSprite = new Room(roomImage, 0, 0, 892, 512, 0, 0, 800, 500, 0, 0);
var details = new Sprite(detailsImage, 0, 0, 892, 512, 0, 0, 800, 500, 0, 0);

function drawCollisionMap(){	//Just a debug function
	let x, y;
	for(y = 0; y < roomCollMapY; y++){
		for(x = 0; x < roomCollMapX; x++){
			if(roomCollMap[y*roomCollMapX+x] == 1) {ctx.beginPath(); ctx.fillStyle = "red"; ctx.rect(roomCollCellWidth * x, roomCollCellHeight * y,800 / roomCollMapX, 500 / roomCollMapY); ctx.fill(); }
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
	currentState.onclick(evt);
}, false);

form.addEventListener('submit', function(e) {
	e.preventDefault();
		if (input.value) {	
			setLocalMessage(input.value);
			input.value = '';
		}
});

function render(){
	currentState.render();
	requestAnimationFrame(render);
}

function main(){
	currentState.main();
	getFPS();
	requestAnimationFrame(main);
}

let lastCalledTime = Date.now();

function getFPS() {
	if (lastCalledTime) {
		delta = (Date.now() - lastCalledTime)/1000;
		let fps = 1/delta;
		timeScale = fps > 10 ? fps/60 : 10/60;
	}
	lastCalledTime = Date.now();
}

localPlayer.items.forEach(item => {
	localPlayer.addItem(item.ItemClass, item.ItemId);
});
document.getElementById('loading').remove();

render();
main();