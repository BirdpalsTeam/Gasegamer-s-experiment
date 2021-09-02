class Sprite{
	constructor(img,sourceX,sourceY,sourceWidth,sourceHeight,x,y,width,height,originX,originY){
		this.img = img;
		this.sourceX = sourceX;
		this.sourceY = sourceY;
		this.sourceWidth = sourceWidth;
		this.sourceHeight = sourceHeight;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.originX = originX;
		this.originY = originY;
	}

	draw(){
		ctx.drawImage(this.img,this.sourceX,this.sourceY,this.sourceWidth,this.sourceHeight,this.x - this.originX, this.y - this.originY, this.width, this.height);
		this.customDraw();
	}

	customDraw(){

	}
}

class Player extends Sprite{
	constructor(player){
		super(birdImage, 37, 175, 110, 154, player.x, player.y, player.width, player.height, player.width / 2, player.height * 0.85);
		this.speechBubbleImage = bubble_image;
		this.id = player.id;
		this.username = player.username;
		this.isMoving = player.isMoving;
		this.mouseX = player.mouseX;
		this.mouseY = player.mouseY;
		this.movePlayerInterval;
		this.messageTimeout;
		this.isDev = player.isDev;
		this.canMove = true;
		this.canDrawUsername = true;
		//items
		this.items = player.items;
		this.itemsImgs = new Array();
		if(this.id == sessionStorage.playerId) this.local = true;
		this.layer = 1;
		//card
		this.bio = player.bio;
		if(this.local != true){
			this.card = new PlayerCard(inventoryImage, this, 3, 0);
		}

		this.spriteCrops=[[37,175,110,154],[253,175,110,154],[147,175,110,154],[37,25,110,154],[147,25,110,154],[253,25,110,154]];
		this.width = birdSize.width;
		this.height = birdSize.height;
		this.recalculateOrigin();
	}

	customDraw(){
		//draw items
		this.itemsImgs.forEach((item) => {
				item.draw();
		});

		if(this.card != undefined && this.card.playerButton.isInsideButton(mousePos) == true && this.card.isOpen == false){
			if(localPlayer.isMoving == true){
				localPlayer.isMoving = false;
				clearInterval(localPlayer.movePlayerInterval);
			}
			this.card.open();
		}else if(this.card != undefined && this.card.closeButton.isInsideButton(mousePos) == true && this.card.isOpen == true){
			this.card.close();
		}
	}
	
	drawUsername(){
		let username = this.username;
		let x = this.x;
		let y = this.y;
		let height = this.height;
		function outline(bolder, outlineWidth, baseColor){
			ctx.font = bolder + "15px sans-serif";
			ctx.strokeStyle = "black";
			ctx.lineWidth = outlineWidth;
			ctx.lineJoin = "round";
			ctx.strokeText(username, x, y + height / 3.5);
			ctx.fillStyle = baseColor;
			ctx.fillText(username, x, y + height / 3.5);
		}
		ctx.textAlign = 'center';
		if(this.local == true){
			outline("bolder ", 6, "white");
		}else{
			outline("", 4.5, "white");
		}
	}

	drawBubble(){
		//draw bubble
		if(this.message != undefined){
			let textHeight, imageHeight, bubbleHeight;
			if(this.message.length > 0 && this.message.length < 18){
				bubbleHeight = -6;
				imageHeight = 47;
				textHeight = 20;
			}else if(this.message.length >= 18 && this.message.length < 30){
				bubbleHeight = 5;
				imageHeight = 57;
				textHeight = 20;
			}
			else if(this.message.length >= 30 && this.message.length <= 52){
				bubbleHeight = 45;
				imageHeight = 97;
				textHeight = 33;
			}
			let drawHeight = this.y - this.height - bubbleHeight;
			ctx.drawImage(this.speechBubbleImage, 0, 0, 262, 94, this.x - 45, drawHeight, 131, imageHeight); //draws the bubble
			canvasTxt.fontSize = 14;
			canvasTxt.font = "sans-serif";
			ctx.fillStyle = "black";
			canvasTxt.align = 'center';
			//canvasTxt.debug = true; //good way to test the text size
			canvasTxt.drawText(ctx, this.message, this.x - this.originX, drawHeight + 2 , 100, imageHeight - textHeight); //draws the message
		}
	}

	hideBubble(){
			this.messageTimeout = setTimeout(() => {
				clearTimeout(this.messageTimeout);
				this.message = undefined;
			}, 10000);
		
	}

	whereToLook(){
		let dx = this.mouseX - this.x;
		let dy = this.mouseY - this.y;

		let angleToLook = Math.atan2(dy, dx) * 180 / Math.PI;
		
		let newSX;
		let newSY;

		let lookingInt = 1;

		if(angleToLook < 0) angleToLook += 360;

		if(angleToLook > 70 && angleToLook<= 110){	//look to the front
			lookingInt = 1;
		}else if (angleToLook > 110 && angleToLook <= 220){//look to the left
			lookingInt = 2;
		}else if(angleToLook > 220 && angleToLook <= 260){ //look to the upper left
			lookingInt = 3;
		}else if(angleToLook > 260 && angleToLook <= 281 ){//look to the back
			lookingInt = 4;
		}else if(angleToLook > 281 && angleToLook <= 330){//look to the upper right
			lookingInt = 5;
		}else if(angleToLook > 330 && angleToLook <= 360 || angleToLook <= 70){//look to the right
			lookingInt = 6;
		}

		newSX = this.spriteCrops[lookingInt-1][0];
		newSY = this.spriteCrops[lookingInt-1][1];

		this.sourceX = newSX;
		this.sourceY = newSY;

		if(this.itemsImgs.length > 0){
			this.itemsImgs.forEach((item) => {
				item.sourceX = newSX;
				item.sourceY = newSY;
			});
		}
	}
	move(){
		// get the difference vector between the player position and the mouse position
		//Notice that lastX is the position of the player when he clicked somwhere on the screen
		if(this.canMove == true){
			if(this.isMoving == false){
				this.movePlayer();
			}else{
				this.isMoving = false;
				clearInterval(this.movePlayerInterval);
				this.movePlayer();
			}
			this.whereToLook();
		}	
	}

	movePlayer(){
		this.isMoving = true;
		let dx = this.mouseX - this.x;
		let dy = this.mouseY - this.y;
		
		let angleToMove = Math.atan2(dy,dx);

		let speed = 4;

		let velX = Math.cos(angleToMove) * speed;
		let velY = Math.sin(angleToMove) * speed;

		let timeToPlayerReachDestination = Math.floor(dx/velX);
		let collided, willCollide;
		function predictCollision(x1, y1, x2, y2, x, y)
		{
			//x1 and y1 are bottom-left and x2 and y2 are top-right
			if (x > x1 && x < x2 && y > y1 && y < y2){
				willCollide = false;
			}else{
				willCollide = true;
			}
		}

		predictCollision(predictArray[0],predictArray[1],predictArray[2],predictArray[3],this.mouseX,this.mouseY);

		this.movePlayerInterval = setInterval(() => {
			if(willCollide == true){
				for(let i = 0; i < collisionArray.length; i+=2){
					if(timeToPlayerReachDestination <= 0) return collided = true;
					if(this.x + velX <= collisionArray[i] + roomCollCellWidth && this.x + velX >= collisionArray[i]){
						if(this.y + velY <= collisionArray[i + 1] + roomCollCellHeight && this.y + velY >= collisionArray[i + 1]){
							this.isMoving = false;
							clearInterval(this.movePlayerInterval);
							collided = true;
						}
					}
				}
				if(collided == true){
					triggers.forEach(function(tempTrigger){ //Goes through each trigger to see if the player is within it
						if(localPlayer.y >= tempTrigger[1] && localPlayer.y <= tempTrigger[3] && localPlayer.x >= tempTrigger[0] && localPlayer.x <= tempTrigger[2]){
							activateTrigger(tempTrigger);
						}
					});
					return;
				}
			}
			
			this.x += velX;
			this.y += velY;
			timeToPlayerReachDestination--;
			this.itemsImgs.forEach((item) => {
				item.x = this.x;
				item.y = this.y;
			});
			if(this.card != undefined){
				this.card.playerButton.x = this.x;
				this.card.playerButton.y = this.y;
			}

			if(timeToPlayerReachDestination <= 0){
				this.isMoving = false;
				clearInterval(this.movePlayerInterval);
			}
			
		}, 1000 / 60);
	
	}

	addItem(itemtype, itemname){
		let tempItemImg = new Image();
		let itemsImgs = this.itemsImgs;
		let sX= this.sourceX;
		let sY = this.sourceY;
		let sW = this.sourceWidth;
		let sH = this.sourceHeight;
		let x = this.x;
		let y = this.y;
		let w = this.width;
		let h = this.height;
		let oX = this.originX;
		let oY = this.originY;
		function addItemImg(layer){
			tempItemImg.src = itemsSrc + itemtype + "/" + itemname + ".png";
			itemsImgs.push(new Item(tempItemImg,sX, sY, sW, sH, x, y, w, h, oX, oY, layer, itemtype, itemname));
		}
		switch (itemtype) {
			case "color":
				tempItemImg.src = itemsSrc + itemtype + "/" + itemname + ".png";
				this.img = tempItemImg;
				this.img.name = itemname;
				break;
			case "hand":
				addItemImg(6);
				break;
			case "head":
				addItemImg(5);
				break;
			case "face":
				addItemImg(4);
				break;
			case "neck":
				addItemImg(3);
				break;
			case "body":
				addItemImg(2);
				break;
			case "feet":
				addItemImg(1);
				break;
			
		}
		this.itemsImgs.sort(function(a, b){return a.layer-b.layer});
	}
	
	removeItem(itemName){
		removeElementFromArray(itemName, this.itemsImgs);
	}

	recalculateOrigin(){
		this.originX = this.width/2;
		this.originY = this.height * 0.85;
	}
}

class Item extends Sprite{
	constructor(img, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height, originX, originY, layer, type, name){
		super(img, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height, originX, originY);
		this.layer = layer;
		this.type = type;
		this.name = name;
	}
}

class NPC extends Sprite{
	constructor(img, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height, originX, originY, name){
		super(img, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height, originX, originY);

		this.name = name;
	}

	drawName(){
		let username = this.name;
		let x = this.x;
		let y = this.y;
		let height = this.height;
		ctx.font = "15px sans-serif";
		ctx.strokeStyle = "black";
		ctx.lineWidth = 4.5;
		ctx.lineJoin = "round";
		ctx.fillStyle = "white";
		ctx.fillText(username, x, y + height / 3.5);
		ctx.textAlign = 'center';
	}
}

class Room extends Sprite{
	constructor(img, layer, type, width, height){
		super(img, 0, 0, 892, 512, 0, 0, width, height, layer, type);
		this.layer = layer;
		this.type = type;
	}
}

class Room_Details extends Sprite{
	constructor(img, layer, type, width, height){
		super(img, 0, 0, 892, 512, 0, 0, width, height, layer, type);
		this.layer = layer;
		this.type = type;
	}
}

class Button{
	constructor(x, y, width, height){
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.isSelected = false;
		this.isOver = false;
	}

	isInsideButton(pos){
		if(pos.x > this.x && pos.x < this.x + this.width && pos.y < this.y + this.height && pos.y > this.y){
			this.isSelected == false ? this.isSelected = true : this.isSelected = false;
			return true;
		}
	}

	isOverButton(pos){
		if(pos.x > this.x && pos.x < this.x + this.width && pos.y < this.y + this.height && pos.y > this.y){
			return true;
		}
	}
}

class Inventory extends Sprite{
	constructor(img, layer, type){
		super(img, 0, 0, 892, 512, 0, 0, 1000, 600, layer, type);
		this.layer = layer;
		this.type = type;
		this.isOpen = false;
		this.closeButton = new Button(870, 30, 65, 86);
		this.bioButton = new Button(355, 505, 60, 50);
		this.isChanging = false;
		this.bigBird = {x: this.x + 150, y: this.y + 150};
		this.bigBird.img = new Image();
		this.bigBird.shadowImg = new Image();
		this.bigBird.img.src = hudSrc + "big_bird.png";
		this.bigBird.shadowImg.src = hudSrc + 'big_bird_shadow.png';
		this.canDrawBigBird = false;
		this.canDrawGrid = true;
		this.canDrawBio = false;
	}

	open(){
		if(this.isOpen == false){
			this.isChanging == false ? this.getInventory() : this.createItemsButtons();
			this.isOpen = true;
			localPlayer.canMove = false;
			this.canDrawBigBird = false;
			this.canDrawGrid = true;
			this.canDrawBio = false;
		}
	} 

	close(){
		if(this.closeButton.isInsideButton(mousePos) == true){
			this.isChanging = true;
			command('/updateInventory', this.items);
			this.updateGear();
			this.isOpen = false;
			localPlayer.canMove = true;
		}
	}

	getInventory(){
		PlayFabClientSDK.GetUserInventory({SessionTicket: sessionStorage.ticket}, (result, error) =>{
			if(result !== null){
				this.items = result.data.Inventory;
				this.createItemsButtons();
			}else if(error !== null){
				console.log(error);
			}
		})
	}

	createItemsButtons(){
		let pastX = 513;
		let pastY = 132;
		for(let i = 0; i < this.items.length; i++){
			if(i % 4 == 0 && i != 0){
				pastX = 507;
				pastY += 77.5;
			}
			this.items[i].button = new Button(pastX, pastY, 85, 77.5);
			if(this.items[i].CustomData.isEquipped == 'true') this.items[i].button.isSelected = true;
			pastX += 95;
		}
		this.canDrawItems = true;
	}

	updateGear(){
		localPlayer.items = this.items;
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
	}

	drawSquares(pastX, pastY, squareHeight, array, callback){
		for(let i = 0; i < array.length; i++){
			if(i % 4 == 0 && i != 0){
				pastX = 511;
				pastY += squareHeight;
			}
			callback(array, i, pastX, pastY);
			pastX += 95;
		}
	}

	drawItems(items, i, pastX, pastY){
		items[i].img = new Image();
		items[i].img.src = itemsSrc + items[i].ItemClass + "/" + items[i].ItemId + "_icon.png";
		ctx.fillStyle = "#bab6aa";
		ctx.fillRect(pastX - 4, pastY, 95, 85); //draws the grey rectangle
		ctx.drawImage(items[i].img, pastX, pastY + 2);
		
		if(items[i].button.isSelected == true){
			ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
			ctx.fillRect(pastX - 4, pastY - 3, 95, 85); //draws the grey rectangle
		}

		items[i].button.isOverButton(mouseOver) == true ? items[i].button.isOver = true : items[i].button.isOver = false;

		if(items[i].button.isOver == true){
			ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
			ctx.fillRect(pastX - 4, pastY, 95, 85); //draws the grey select rectangle
		}
	}

	selectItem(){
		this.items.forEach(item =>{
			item.button.isInsideButton(mousePos);
			if(item.button.isSelected == true){
				item.CustomData.isEquipped = "true";
				this.items.forEach(fItem =>{
					if(fItem.ItemClass == item.ItemClass && fItem.ItemId != item.ItemId && fItem.CustomData.isEquipped == "true"){
						fItem.CustomData.isEquipped = "false";
						fItem.button.isSelected = false;
					}
				})
			}else{
				item.CustomData.isEquipped = "false";
			}
		})
	}

	drawGrid(){
		let pastX = 507;
		let pastY = 127;
		let squareWidth = 95;
		let squareHeight = 87.5;
		for(let i = 0; i < 16; i++){
			if(i % 4 == 0 && i != 0){
				pastX = 507;
				pastY += squareHeight;
			}
			ctx.beginPath();
			ctx.rect(pastX, pastY, squareWidth, squareHeight);
			ctx.strokeStyle = "black";
			ctx.stroke();
			pastX += 95;
		}
	}

	drawWhiteRectangle(){
		if(this.canDrawItems == true){
			let pastX = 511;
			let pastY = 130;
			for(let i = 0; i < this.items.length; i++){
				if(i % 4 == 0 && i != 0){
					pastX = 511;
					pastY += 87.5;
				}
				if(this.items[i].button.isSelected == true){
					ctx.beginPath();
					ctx.strokeStyle = "white";
					ctx.lineWidth = 6;
					ctx.rect(pastX - 4, pastY - 3.2, 95, 87.5); //draws the white rectangle
					ctx.stroke();
				}
				pastX += 95;
			}
		}
	}
	
	grayCloseButton(){
		ctx.fillStyle = "rgba(0, 0, 0, 0.4)"
		ctx.beginPath();
		ctx.moveTo(this.closeButton.x, this.closeButton.y);
		ctx.lineTo(this.closeButton.x + 66,this.closeButton.y);
		ctx.lineTo(this.closeButton.x + 70, 100);
		ctx.fill();
		ctx.beginPath();
		ctx.moveTo(this.closeButton.x, this.closeButton.y);
		ctx.bezierCurveTo(this.closeButton.x, this.closeButton.y + 15,this.closeButton.x + 35, this.closeButton.y + 60, this.closeButton.x + 70, 100);
		ctx.fill();
	}

	drawBigBird(){
		ctx.drawImage(this.bigBird.shadowImg, this.bigBird.x, this.bigBird.y + 230);
		ctx.drawImage(this.bigBird.img, this.bigBird.x, this.bigBird.y);
		this.bigBird.items = this.items;
		this.bigBird.gear = new Array();
		this.bigBird.colors = new Array();
		this.bigBird.items.forEach(item =>{
			if(item.button.isSelected == true){
				item.img = new Image();
				item.img.src = itemsSrc + item.ItemClass + '/' + item.ItemId + '_big.png';
				let imgX, imgY, imgLayer;
				let canPush = false;
				switch(item.ItemClass){
					case 'hand':
						imgX = this.bigBird.x;
						imgY = this.bigBird.y;
						canPush = true
						imgLayer = 6;
						break;
					case 'head':
						imgX = this.bigBird.x + 14;
						imgY = this.bigBird.y - 14;
						canPush = true;
						imgLayer = 5;
						break;
					case 'face':
						imgX = this.bigBird.x + 30;
						imgY = this.bigBird.y + 47;
						canPush = true;
						imgLayer = 4;
						break;
					case 'neck':
						imgX = this.bigBird.x + 75;
						imgY = this.bigBird.y + 150;
						canPush = true
						imgLayer = 3;
						break;
					case 'body':
						imgX = this.bigBird.x;
						imgY = this.bigBird.y;
						canPush = true
						imgLayer = 2;
						break;
					case 'feet':
						imgX = this.bigBird.x;
						imgY = this.bigBird.y;
						canPush = true
						imgLayer = 1;
						break;
					case 'color':
						this.bigBird.img.src = item.img.src;
						this.bigBird.colors.push(item);
						canPush = false;
						imgLayer = 0;
						break;
				}
				if(canPush == true){this.bigBird.gear.push({i: item.img, x: imgX, y: imgY, layer: imgLayer});}
			}
		})
		this.bigBird.gear.sort((b, a) => {return b.layer - a.layer});
		this.bigBird.gear.forEach((item) =>{
			ctx.drawImage(item.i, item.x, item.y);
		})
		if(this.bigBird.colors.length > 0){
			this.bigBird.colors.forEach((item)=>{
				if(item.button.isSelected == false){
					removeElementFromArray(item, this.bigBird.colors);
				}
			})
		}else{
			this.bigBird.img.src = hudSrc + "big_bird.png";
		}
	}

	drawUsername(){
		if(localPlayer.username.length > 16){
			ctx.font = '46px Caslon';
		}else{
			ctx.font = '55px Caslon';
		}
		ctx.fillStyle = '#615f5b';
		ctx.fillText(localPlayer.username, this.x + 260, this.y + 80);
	}

	writeBio(){
		this.bioButton.isInsideButton(mousePos);
		if(this.bioButton.isSelected == true){
			this.canDrawItems = false;
			this.canDrawGrid = false;
			this.canDrawBio = true;
			this.saveBio();
			bioInput.hidden = false;
			if(localPlayer.bio != "I like to play Birdpals!"){
				bioInput.value = localPlayer.bio;
			}
		}else{
			this.canDrawItems = true;
			this.canDrawGrid = true;
			this.canDrawBio = false;
			bioInput.hidden = true;
			bioInput.disabled = false;
		}
	}
	saveBio(){
		bioInput.onkeyup = function(evt) {
            evt = evt || window.event;

            if (evt.keyCode == 13) {
				 bioInput.disabled = true;
				 command('/changeBio', bioInput.value);
				 localPlayer.bio = bioInput.value;
            }
        };
	}
	customDraw(){
		if(this.isOpen == true){
			if(this.closeButton.isOver == true){
				this.grayCloseButton();
			}
			if(this.canDrawItems == true){
				this.drawSquares(511, 130, 87, this.items, this.drawItems);
				this.canDrawBigBird = true;
			}
			if(this.canDrawBigBird == true){
				this.drawBigBird();
			}
			this.drawUsername();
			if(this.canDrawGrid == true){
				this.drawGrid();
			}
			if(this.canDrawBio == true){
				ctx.beginPath();
				ctx.rect(507, 130, 380, 350);
				ctx.strokeStyle = "black";
				ctx.stroke();
			}
			this.drawWhiteRectangle();
		}
	}
}

class PlayerCard extends Sprite{
	constructor(img, player, layer, type){
		super(img, 0, 0, 892, 512, 0, 0, 1000, 600, layer, type);
		this.username = player.username;
		this.layer = layer;
		this.type = type;
		this.isOpen = false;
		this.closeButton = new Button(870, 30, 65, 86);
		this.playerButton = new Button(player.x - player.originX, player.y - player.originY, player.width, player.height);
		this.bigBird = {x: this.x + 150, y: this.y + 150};
		this.bigBird.img = new Image();
		this.bigBird.shadowImg = new Image();
		this.bigBird.img.src = hudSrc + "big_bird.png";
		this.bigBird.shadowImg.src = hudSrc + 'big_bird_shadow.png';
		this.bio = player.bio;
		this.p = player;
	}

	open(){
		if(this.isOpen == false){
			this.isOpen = true;
			localPlayer.canMove = false;
			localPlayer.canDrawUsername = false;
			this.items = this.p.items;
		}
	} 

	close(){
		if(this.closeButton.isInsideButton(mousePos) == true){
			this.isOpen = false;
			localPlayer.canMove = true;
			localPlayer.canDrawUsername = true;
		}
	}

	grayCloseButton(){
		ctx.fillStyle = "rgba(0, 0, 0, 0.4)"
		ctx.beginPath();
		ctx.moveTo(this.closeButton.x, this.closeButton.y);
		ctx.lineTo(this.closeButton.x + 66,this.closeButton.y);
		ctx.lineTo(this.closeButton.x + 70, 100);
		ctx.fill();
		ctx.beginPath();
		ctx.moveTo(this.closeButton.x, this.closeButton.y);
		ctx.bezierCurveTo(this.closeButton.x, this.closeButton.y + 15,this.closeButton.x + 35, this.closeButton.y + 60, this.closeButton.x + 70, 100);
		ctx.fill();
	}

	drawBiographyArea(){
		ctx.beginPath();
		ctx.rect(507, 130, 380, 350);
		ctx.strokeStyle = "black";
		ctx.stroke();
		canvasTxt.fontSize = 30;
		canvasTxt.font = "Caslon";
		canvasTxt.drawText(ctx, this.bio, 510, 135 , 370, 335); //draws the message
	}

	drawUsername(){
		if(this.username.length > 16){
			ctx.font = '46px Caslon';
		}else{
			ctx.font = '55px Caslon';
		}
		ctx.fillStyle = '#615f5b';
		ctx.fillText(this.username, this.x + 260, this.y + 80);
	}

	drawBigBird(){
		ctx.drawImage(this.bigBird.shadowImg, this.bigBird.x, this.bigBird.y + 230);
		ctx.drawImage(this.bigBird.img, this.bigBird.x, this.bigBird.y);
		this.bigBird.items = this.items;
		this.bigBird.gear = new Array();
		this.bigBird.colors = new Array();
		this.bigBird.items.forEach(item =>{
			item.img = new Image();
			item.img.src = itemsSrc + item.ItemClass + '/' + item.ItemId + '_big.png';
			let imgX, imgY;
			let canPush = false;
			switch(item.ItemClass){
				case 'head':
					imgX = this.bigBird.x + 14;
					imgY = this.bigBird.y - 14;
					canPush = true;
					break;
				case 'face':
					imgX = this.bigBird.x + 30;
					imgY = this.bigBird.y + 47;
					canPush = true;
					break;
				case 'neck':
					imgX = this.bigBird.x + 75;
					imgY = this.bigBird.y + 150;
					canPush = true;
					break;
				case 'feet':
					imgX = this.bigBird.x;
					imgY = this.bigBird.y;
					canPush = true;
					break;
				case 'hand':
					imgX = this.bigBird.x;
					imgY = this.bigBird.y;
					canPush = true;
					break;
				case 'color':
					this.bigBird.img.src = item.img.src;
					this.bigBird.colors.push(item);
					canPush = false;
					break;
			}
			if(canPush == true){this.bigBird.gear.push({i: item.img, x: imgX, y: imgY});}
		})
		this.bigBird.gear.sort((b, a) => {return a.y - b.y});
		this.bigBird.gear.forEach((item) =>{
			ctx.drawImage(item.i, item.x, item.y);
		})
		if(this.bigBird.colors.length == 0){
			this.bigBird.img.src = hudSrc + "big_bird.png";
		}

	}

	customDraw(){
		if(this.isOpen == true){
			if(this.closeButton.isOver == true){
				this.grayCloseButton();
			}
			this.drawUsername();
			this.drawBigBird();
			this.drawBiographyArea();
			this.closeButton.isOverButton(mouseOver) == true ? this.closeButton.isOver = true : this.closeButton.isOver = false;
		}
	}
	
}
