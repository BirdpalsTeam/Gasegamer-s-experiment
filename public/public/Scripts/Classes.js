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

			if(this.isMoving == false){
				this.movePlayer();
			}else{
				this.isMoving = false;
				clearInterval(this.movePlayerInterval);
				this.movePlayer();
			}
			this.whereToLook();
			
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
				tempItemImg.src = charactersSrc + itemname + ".png";
				this.img = tempItemImg;
				this.img.name = itemname;
				break;
		
			default:
				tempItemImg.src = "Sprites/items/" + itemtype + "/" + itemname + ".png";
				this.itemsImgs.push(new Item(tempItemImg, this.sourceX, this.sourceY, this.sourceWidth, this.sourceHeight, this.x, this.y, this.width, this.height, this.originX, this.originY, 1, itemtype));
			break;
		}

		this.items.sort(function(a, b){a.layer, b.layer});
		
	}
	
}

class Item extends Sprite{
	constructor(img,sourceX,sourceY,sourceWidth,sourceHeight,x,y,width,height,originX,originY, layer, type){
		super(img,sourceX,sourceY,sourceWidth,sourceHeight,x,y,width,height,originX,originY);
		this.layer = layer;
		this.type = type;
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