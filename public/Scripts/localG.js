document.getElementById('inputElements').hidden = false;
form = document.getElementById("form");
input = document.getElementById("input");
PlayFab.settings.titleId = '238E6';
PlayFab._internalSettings.sessionTicket = sessionStorage.ticket;

let timeScale = 1;

var roomSprite = new Room(roomImage, 0, 0, 1000, 600);
var foreground = new Room_Details(foregroundImage, 3, 0, 1000, 600);
var inventory = new Inventory(inventoryImage, 4, 0);
function drawCollisionMap(){	//Just a debug function
	let x, y;
	for(y = 0; y < roomCollMapY; y++){
		for(x = 0; x < roomCollMapX; x++){
			if(roomCollMap[y*roomCollMapX+x] == 1) {ctx.beginPath(); ctx.fillStyle = "red"; ctx.rect(roomCollCellWidth * x, roomCollCellHeight * y,canvas.width / roomCollMapX, canvas.height / roomCollMapY); ctx.fill(); }
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
canvas.addEventListener('mousemove', function(evt){
	currentState.onmousemove(evt);
})

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

if(localPlayer.items.length > 0){
	localPlayer.items.forEach(item => {
		localPlayer.addItem(item.ItemClass, item.ItemId);
	});
}
document.getElementById('loading').remove();
document.getElementById('inventory').onclick = function(){inventory.open()};

render();
main();