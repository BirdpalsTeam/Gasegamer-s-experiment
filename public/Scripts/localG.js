document.getElementById('inputElements').hidden = false;
form = document.getElementById("form");
input = document.getElementById("input");
PlayFab.settings.titleId = '238E6';
PlayFab._internalSettings.sessionTicket = sessionStorage.ticket;

let timeScale = 1;

var roomSprite = new Room(roomImage, 0, 0, 1000, 600);
var foreground = new Room_Details(foregroundImage, 3, 0, 1000, 600);
var inventory = new Inventory(inventoryImage, 4, 0);
changeRoomWidthAndHeight(roomSprite, "town");
changeRoomWidthAndHeight(foreground, "town");

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

txt_canvas.addEventListener('click', function(evt) {
	currentState.onclick(evt);
}, false);
txt_canvas.addEventListener('mousemove', function(evt){
	currentState.onmousemove(evt);
})

form.addEventListener('submit', function(e) {
	e.preventDefault();
		if (input.value) {	
			setLocalMessage(input.value);
			addToChatbox(localPlayer.username + ": " + input.value);
			input.value = '';
		}
});

var achievementAnimPlaying = false;
var achievementBox = new Shape(0, 0, 300, 0, "yellow");
var achievementTimeout = null;
var achievementHeightIncrease = 1;
var achievementInfo = {name:"", image:""};
function getAchievement(tempinfo){
	achievementInfo = tempinfo;
	achievementBox.height = 0;
	achievementHeightIncrease = 1;
	achievementAnimPlaying = true;
	renderAchievement();
	achievementTimeout = setTimeout(function(){achievementHeightIncrease = -1;},5000);
	achievementTimeout = setTimeout(function(){achievementAnimPlaying = false;},10000);
}
function renderAchievement(){
	if(achievementHeightIncrease == 1){
		if(achievementBox.height <= 100)
			achievementBox.height += achievementHeightIncrease * timeScale;
	}
	else{
		achievementBox.height += achievementHeightIncrease * timeScale;
	}
	achievementBox.draw();
}

function render(){
	currentState.render();
	if(achievementAnimPlaying){renderAchievement()}
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
loading_screen.hidden = true;
document.getElementById('inventory').onclick = function(){inventory.open()};
document.getElementById('toggleChatbox').onclick = function(){toggleChatbox();};

render();
main();