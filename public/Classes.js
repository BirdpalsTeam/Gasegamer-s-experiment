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
	}
}

class Player extends Sprite{
	constructor(img,sourceX,sourceY,sourceWidth,sourceHeight,x,y,width,height,originX,originY,speechBubbleImage,id,socket,username, isMoving, mouseX, mouseY){
		super(img,sourceX,sourceY,sourceWidth,sourceHeight,x,y,width,height,originX,originY);
		this.speechBubbleImage = speechBubbleImage;
		this.id = id;
		this.socket = socket;
		this.username = username;
		this.isMoving = isMoving;
		this.mouseX = mouseX;
		this.mouseY = mouseY;
		this.movePlayerInterval;
		this.messageTimeout;
	}

	drawUsername(){
		ctx.fillStyle = "black";
		ctx.font = "15px sans-serif";
		ctx.textAlign = 'center'
		ctx.fillText(this.username,this.x,this.y + this.height / 2.5);
	}

	drawBubble(){
		ctx.fillStyle = "black";
		ctx.font = "13px sans-serif";
		ctx.textAlign = 'center';
		
		if(this.message.length > 0 && this.message.length <18){
			ctx.drawImage(this.speechBubbleImage, 0, 0, 262, 94, this.x - 66, this.y - this.height - 35, 131, 47); 
			ctx.fillText(this.message.toLowerCase(),this.x , this.y - 85);
		}else if(this.message.length >= 18 && this.message.length < 30){
			ctx.drawImage(this.speechBubbleImage, 0, 0, 262, 94, this.x - 66, this.y - this.height - 65, 131, 57); 
			wrapText(ctx,this.message.toLowerCase(),this.x,this.y - 120, 110, 12);
		}
		else if(this.message.length >=30){
			ctx.drawImage(this.speechBubbleImage, 0, 0, 262, 94, this.x - 66, this.y - this.height - 80, 131, 77); 
			wrapText(ctx,this.message.toLowerCase(),this.x,this.y - 130, 110, 12);	
		}
	
		function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
			var words = text.split(' ');
			var line = '';
	
			for(var n = 0; n < words.length; n++) {
			  var testLine = line + words[n] + ' ';
			  var metrics = ctx.measureText(testLine);
			  var testWidth = metrics.width;
			  if (testWidth > maxWidth && n > 0) {
				ctx.fillText(line, x, y);
				line = words[n] + ' ';
				y += lineHeight;
			  }
			  else {
				line = testLine;
			  }
			}
			ctx.fillText(line, x, y);
			ctx.textAlign = "center";
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

		if(angleToLook < 0) angleToLook += 360;

		if(angleToLook> 70 && angleToLook<= 110){	//look to the front
			this.sourceX = 144;
			this.sourceY = 0;
		}else if (angleToLook>110&& angleToLook<=250){//look to the left
			this.sourceX = 0;
			this.sourceY = 172;
		}else if(angleToLook > 250 && angleToLook <= 281 ){//look to the back
			this.sourceX = 0;
			this.sourceY = 0;
		}
		else if(angleToLook > 281 && angleToLook <= 360 || angleToLook <= 70){//look to the right
			this.sourceX = 144;
			this.sourceY = 172;
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
