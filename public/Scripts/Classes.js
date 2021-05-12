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
	constructor(img, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height, originX, originY, speechBubbleImage, id, username, isMoving, mouseX, mouseY, isDev){
		super(img,sourceX,sourceY,sourceWidth,sourceHeight,x,y,width,height,originX,originY);
		this.speechBubbleImage = speechBubbleImage;
		this.id = id;
		this.username = username;
		this.isMoving = isMoving;
		this.mouseX = mouseX;
		this.mouseY = mouseY;
		this.movePlayerInterval;
		this.messageTimeout;
		this.isDev = isDev;
	}

	customDraw(){
		//draw bubble
		if(this.message != undefined){
			ctx.fillStyle = "black";
			ctx.font = "13px sans-serif";
			ctx.textAlign = 'center';
			if(isCaptalized(this.message, 70) == false){
				if(this.message.length > 0 && this.message.length <18){
					ctx.drawImage(this.speechBubbleImage, 0, 0, 262, 94, this.x - 66, this.y - this.height - 25, 131, 47); 
					ctx.fillText(this.message,this.x , this.y - 85);
				}else if(this.message.length >= 18 && this.message.length < 30){
					drawWrapText(this.speechBubbleImage, this.message, this.x, this.y, this.height, 35, 57, 100);
				}
				else if(this.message.length >= 30 && this.message.length <= 52){
					drawWrapText(this.speechBubbleImage, this.message, this.x, this.y, this.height, 50, 77, 110);
				}
			}
		}
	}

	drawUsername(){
		//drawUsername
		ctx.fillStyle = "black";
		ctx.font = "15px sans-serif";
		ctx.textAlign = 'center'
		ctx.fillText(this.username,this.x,this.y + this.height / 2.5);
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
		
		if(angleToLook < 0) angleToLook += 360;

		if(angleToLook > 70 && angleToLook<= 110){	//look to the front
			this.sourceX = 37;
			this.sourceY = 175;
		}else if (angleToLook > 110 && angleToLook <= 220){//look to the left
			this.sourceX = 253;
			this.sourceY = 175;
		}else if(angleToLook > 220 && angleToLook <= 260){ //look to the upper left
			this.sourceX = 147;
			this.sourceY = 175;
		}else if(angleToLook > 260 && angleToLook <= 281 ){//look to the back
			this.sourceX = 37;
			this.sourceY = 25;
		}else if(angleToLook > 281 && angleToLook <= 330){//look to the upper right
			this.sourceX = 147;
			this.sourceY = 25;
		}else if(angleToLook > 330 && angleToLook <= 360 || angleToLook <= 70){//look to the right
			this.sourceX = 253;
			this.sourceY = 25;
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

		let velX = Math.cos(angleToMove) * speed;
		let velY = Math.sin(angleToMove) * speed;

		let timeToPlayerReachDestination = Math.floor(dx/velX);

		this.movePlayerInterval = setInterval(() => {
			let x,y;
			for(y = 0; y < roomCollMapY; y++){
				for(x = 0; x < roomCollMapX; x++){
					if(roomCollMap[y*roomCollMapX+x] == 1) {
						if(this.x + velX <= roomCollCellWidth * x + roomCollCellWidth && this.x + velX >= roomCollCellWidth * x){
							if(this.y + velY <= roomCollCellHeight * y + roomCollCellHeight && this.y + velY >= roomCollCellHeight * y){
								this.isMoving = false;
								clearInterval(this.movePlayerInterval);
								return;
							}
						}
					}
				}
			}

			this.x += velX;
			this.y += velY;
			timeToPlayerReachDestination--;

			if(timeToPlayerReachDestination == 0 || timeToPlayerReachDestination < 0){
				this.isMoving = false;
				clearInterval(this.movePlayerInterval);
			}
			
		}, 1000 / 60);
	
	}
	
}
