form = document.getElementById("form");
input = document.getElementById("input");
PlayFab.settings.titleId = '238E6';
PlayFab._internalSettings.sessionTicket = sessionStorage.ticket;

let timeScale = 1;

var roomSprite = new Room(roomImage, 0, 0, 892, 512, 0, 0, 1000, 600, 0, 0);
var details = new Sprite(detailsImage, 0, 0, 892, 512, 0, 0, 1000, 600, 0, 0);

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
document.getElementById('inventory').onclick = function(){test()};
function test(){
	command('/updateInventory', true);
	PlayFabClientSDK.GetUserInventory({SessionTicket: sessionStorage.ticket}, (result, error) =>{
		if(result !== null){
			localPlayer.items = result.data.Inventory;
			localPlayer.itemsImgs = new Array();
			let colors = new Array();
			localPlayer.items.forEach((item) => {
				if(item.CustomData.isEquipped == 'true'){
					localPlayer.addItem(item.ItemClass, item.ItemId);
				}
				if(item.ItemClass == 'color'){
					let colorItem = {ItemId: item.ItemId, isEquipped: item.CustomData.isEquipped}
					colors.push(colorItem);
				}
			})
			if(getElementFromArrayByValue('true', 'isEquipped', colors) == false){
				let tempCharacterImg = new Image();
				tempCharacterImg.src = charactersSrc + "bird_blue.png";
				localPlayer.img = tempCharacterImg;
				localPlayer.img.name = 'bird_blue';
			}
		}else if(error !== null){
			console.log(error);
		}
	})
}
render();
main();