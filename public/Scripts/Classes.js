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
		super(birdImage, 37, 175, 110, 154, player.x, player.y, player.width, player.height, 31, 67);

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
		//items
		this.items = player.items;
		this.itemsImgs = new Array();
		if(this.id == sessionStorage.playerId) this.local = true;
		this.layer = 1;
	}

	customDraw(){
		//draw items
		this.itemsImgs.forEach((item) => {
				item.draw();
		});
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
			ctx.strokeText(username, x, y + height / 2.5);
			ctx.fillStyle = baseColor;
			ctx.fillText(username, x, y + height / 2.5);
		}
		ctx.textAlign = 'center';
		if(this.local == true){
			outline("bolder ", 6, "white");
		}else{
			outline("", 4.5, "white");
		}
	}

	drawBubble(){
		var canvasTxt = window.canvasTxt.default;
		//draw bubble
		if(this.message != undefined){
			let textHeight, imageHeight, bubbleHeight;
			if(this.message.length > 0 && this.message.length < 18){
				bubbleHeight = 25;
				imageHeight = 47;
				textHeight = 20;
			}else if(this.message.length >= 18 && this.message.length < 30){
				bubbleHeight = 35;
				imageHeight = 57;
				textHeight = 20;
			}
			else if(this.message.length >= 30 && this.message.length <= 52){
				bubbleHeight = 65;
				imageHeight = 97;
				textHeight = 33;
			}
			let drawHeight = this.y - this.height - bubbleHeight;
			ctx.drawImage(this.speechBubbleImage, 0, 0, 262, 94, this.x - 66, drawHeight, 131, imageHeight); //draws the bubble
			ctx.fontSize = 12;
			canvasTxt.font = "sans-serif";
			ctx.fillStyle = "black";
			//canvasTxt.debug = true; //good way to test the text size
			canvasTxt.drawText(ctx, this.message, this.x - 50, drawHeight + 2 , 100, imageHeight - textHeight); //draws the message
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

		if(angleToLook < 0) angleToLook += 360;

		if(angleToLook > 70 && angleToLook<= 110){	//look to the front
			newSX = 37;
			newSY = 175;
		}else if (angleToLook > 110 && angleToLook <= 220){//look to the left
			newSX = 253;
			newSY = 175;
		}else if(angleToLook > 220 && angleToLook <= 260){ //look to the upper left
			newSX = 147;
			newSY = 175;
		}else if(angleToLook > 260 && angleToLook <= 281 ){//look to the back
			newSX = 37;
			newSY = 25;
		}else if(angleToLook > 281 && angleToLook <= 330){//look to the upper right
			newSX = 147;
			newSY = 25;
		}else if(angleToLook > 330 && angleToLook <= 360 || angleToLook <= 70){//look to the right
			newSX = 253;
			newSY = 25;
		}

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

		let velX = Math.cos(angleToMove) * speed * timeScale;
		let velY = Math.sin(angleToMove) * speed * timeScale;

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

			if(timeToPlayerReachDestination <= 0){
				this.isMoving = false;
				clearInterval(this.movePlayerInterval);
			}
			
		}, 1000 / 60);
	
	}

	addItem(itemtype, itemname){
		let tempItemImg = new Image();
		switch (itemtype) {
			case "color":
				tempItemImg.src = "Sprites/items/" + itemtype + "/" + itemname + ".png";
				this.img = tempItemImg;
				this.img.name = itemname;
				break;
		
			default:
				tempItemImg.src = "Sprites/items/" + itemtype + "/" + itemname + ".png";
				this.itemsImgs.push(new Item(tempItemImg, this.sourceX, this.sourceY, this.sourceWidth, this.sourceHeight, this.x, this.y, this.width, this.height, this.originX, this.originY, 1, itemtype, itemname));
			break;
		}

		this.items.sort(function(a, b){a.layer, b.layer});
		
	}
	
	removeItem(itemName){
		removeElementFromArray(itemName, this.itemsImgs);
	}
}

class Item extends Sprite{
	constructor(img, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height, originX, originY, layer, type, name){
		super(img,sourceX,sourceY,sourceWidth,sourceHeight,x,y,width,height,originX,originY);
		this.layer = layer;
		this.type = type;
		this.name = name;
	}
}

class Room extends Sprite{
	constructor(img, layer, type){
		super(img, 0, 0, 892, 512, 0, 0, 1000, 600, layer, type);
		this.layer = layer;
		this.type = type;
	}
}

class Room_Details extends Sprite{
	constructor(img, layer, type){
		super(img, 0, 0, 892, 512, 0, 0, 1000, 600, layer, type);
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
	}

	isInsideButton(pos){
		if(pos.x > this.x && pos.x < this.x + this.width && pos.y < this.y + this.height && pos.y > this.y){
			this.isSelected == false ? this.isSelected = true : this.isSelected = false;
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
		this.closeButton = new Button(875,30, 65, 86);
		this.isChanging = false;
	}

	open(){
		if(this.isOpen == false){
			this.isChanging == false ? this.getInventory() : this.createItemsButtons();
			this.isOpen = true;
			localPlayer.canMove = false;
		}
	} 

	close(){
		if(this.closeButton.isInsideButton(mousePos) == true){
			command('/updateInventory', this.items);
			this.updateGear();
			this.isOpen = false;
			localPlayer.canMove = true;
			this.canDrawItems = false;
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
				pastX = 507;
				pastY += squareHeight;
			}
			callback(array, i, pastX, pastY);
			pastX += 95;
		}
	}
	drawItems(items, i, pastX, pastY){
		items[i].img = new Image();
		items[i].img.src = "Sprites/items/" + items[i].ItemClass + "/" + items[i].ItemId + "_icon.png";
		ctx.fillStyle = "#bab6aa";
		ctx.fillRect(pastX - 4, pastY - 3, 95, 85); //draws the grey rectangle
		ctx.drawImage(items[i].img, pastX, pastY);
		
		if(items[i].button.isSelected == true){
			ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
			ctx.fillRect(pastX - 4, pastY - 3, 95, 85); //draws the grey rectangle
		}
	}
	selectItem(){
		this.items.forEach(item =>{
			item.button.isInsideButton(mousePos);
			if(item.button.isSelected == true){
				item.CustomData.isEquipped = "true";
			}else{
				item.CustomData.isEquipped = "false";
			}
		})
	}
	drawGrid(pastX, pastY, squareWidth, squareHeight){
		ctx.beginPath();
		ctx.rect(pastX, pastY, squareWidth, squareHeight);
		ctx.strokeStyle = "black";
		ctx.stroke();
	}
	drawWhiteRectangle(pastX, pastY){
		ctx.beginPath();
		ctx.strokeStyle = "white";
		ctx.lineWidth = 6;
		ctx.rect(pastX - 4, pastY - 3.2, 95, 87.5); //draws the white rectangle
		ctx.stroke();
	}
	customDraw(){
		if(this.isOpen == true){
			if(this.canDrawItems == true){
				this.drawSquares(511, 130, 80, this.items, this.drawItems);
			}
			let pastX = 507;
			let pastY = 127;
			let squareWidth = 95;
			let squareHeight = 87.5;
			for(let i = 0; i < 16; i++){
				if(i % 4 == 0 && i != 0){
					pastX = 507;
					pastY += squareHeight;
				}
				this.drawGrid(pastX, pastY, squareWidth, squareHeight);
				pastX += 95;
			}

			if(this.canDrawItems == true){
				let pastX = 511;
				let pastY = 130;
				for(let i = 0; i < this.items.length; i++){
					if(i % 4 == 0 && i != 0){
						pastX = 507;
						pastY += squareHeight;
					}
					if(this.items[i].button.isSelected == true){
						this.drawWhiteRectangle(pastX, pastY);
					}
					pastX += 95;
				}
			}
		}
	}
}