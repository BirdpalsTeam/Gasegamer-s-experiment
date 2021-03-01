class GameObject{
	constructor(id,img,sourceX,sourceY,sourceWidth,sourceHeight,x,y,width,height,originX,originY, mouseX, mouseY, lastX, lastY, message, username){
		this.id = id;
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
		this.mouseX = mouseX;
		this.mouseY = mouseY;
		this.lastX = lastX;
		this.lastY = lastY;
		this.message = message;
		this.username = username;
	}
		drawPlayer(){
		if(click == true && this.id == socket.id){
			this.moveAnim();
		}else if (this.id != socket.id){
			this.moveAnim();
		}
		this.onMessage();

			ctx.drawImage(this.img,this.sourceX,this.sourceY,this.sourceWidth,this.sourceHeight,this.x - this.originX, this.y - this.originY, this.width, this.height);
			ctx.fillStyle = "black";
			ctx.font = "15px sans-serif";
			ctx.textAlign = 'center'
			ctx.fillText(this.username,this.x,this.y + this.height / 2.5);
		}
		drawRoom(){
			ctx.save();
			ctx.drawImage(this.img,this.sourceX,this.sourceY,this.sourceWidth,this.sourceHeight,this.x, this.y, this.width, this.height);
			ctx.restore();
		}
		moveAnim(){
			// get the difference vector between the player position and the mouse position
			//Notice that lastX is the position of the player when he clicked somwhere on the screen
			let dx = this.mouseX - this.lastX;
			let dy = this.mouseY - this.lastY;
			let angle = Math.atan2(dy, dx) * 180 / Math.PI;
			if(angle < 0) angle += 360;

			if(angle> 70 && angle<= 110){	//look to the front
				this.sourceX = 144;
				this.sourceY = 0;
			}else if (angle>110&& angle<=250){//look to the left
				this.sourceX = 0;
				this.sourceY = 172;
			}else if(angle > 250 && angle <= 281 ){//look to the back
				this.sourceX = 0;
				this.sourceY = 0;
			}
			else if(angle > 281 && angle <= 360 || angle <= 70){//look to the right
				this.sourceX = 144;
				this.sourceY = 172;
			}
		
		}
		drawBubble(){
		ctx.font = "13px sans-serif";
		if(this.message.length > 0 && this.message.length <18){
			ctx.drawImage(this.img,this.sourceX,this.sourceY,this.sourceWidth,this.sourceHeight,this.x, this.y, this.width, this.height); 
		}else{
			ctx.drawImage(this.img,this.sourceX,this.sourceY,this.sourceWidth,this.sourceHeight,this.x, this.y -45, this.width, this.height *2);
		}
		}
		onMessage(){
		if (this.message != " " && this.message.length > 0 || this.message != "" && this.message.length > 0) {
			let bubbleGameobject = new GameObject(0,bubble_image,0,0,262,94,this.x - 66,this.y - this.height - 35,131,47,0,0,0,0,0,0,this.message);
			bubbleGameobject.drawBubble();
			if(this.message.length > 0 && this.message.length <18){
				ctx.fillText(this.message,this.x , this.y - 85);
				ctx.textAlign = "center";
			}else{
				wrapText(ctx,this.message,this.x,this.y - 130, 110, 12)	
			}
			
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
}
