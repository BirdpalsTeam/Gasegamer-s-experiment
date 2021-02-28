class GameObject{
	constructor(id,img,sourceX,sourceY,sourceWidth,sourceHeight,x,y,width,height,originX,originY, mouseX, mouseY, lastX, lastY, message){
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
	}
		drawPlayer(){
		if(click == true && this.id == socket.id){
			this.moveAnim();
		}else if (this.id != socket.id){
			this.moveAnim();
		}
		this.onMessage();
			ctx.drawImage(this.img,this.sourceX,this.sourceY,this.sourceWidth,this.sourceHeight,this.x - this.originX, this.y - this.originY, this.width, this.height);
		}
		drawRoom(){
			ctx.save();
			ctx.drawImage(this.img,this.sourceX,this.sourceY,this.sourceWidth,this.sourceHeight,this.x, this.y, this.width, this.height);
			ctx.restore();
		}
		moveAnim(){
			let dx = this.mouseX - this.lastX;
			let dy = this.mouseY - this.lastY;
			let angle = Math.atan2(dy, dx) * 180 / Math.PI;
			if(angle < 0) angle += 360;

			if(angle> 70 && angle<= 110){
				this.sourceX = 144;
				this.sourceY = 0;
			}else if (angle>110&& angle<=250){
				this.sourceX = 0;
				this.sourceY = 172;
			}else if(angle > 250 && angle <= 281 ){
				this.sourceX = 0;
				this.sourceY = 0;
			}
			else if(angle > 281 && angle <= 360 || angle <= 70){
				this.sourceX = 144;
				this.sourceY = 172;
			}
		
		}
		drawBubble(){
		ctx.drawImage(this.img,this.sourceX,this.sourceY,this.sourceWidth,this.sourceHeight,this.x, this.y, this.width, this.height);
		
		ctx.font = "15px sans-serif";
		}
		onMessage(){
		if (this.message != " " && this.message.length > 0 || this.message != "" && this.message.length > 0) {
			let bubbleGameobject = new GameObject(0,bubble_image,0,0,262,94,this.x - 66,this.y - this.height - 35,131,47,0,0,0,0,0,0,this.message);
			bubbleGameobject.drawBubble();
			ctx.fillText(this.message,this.x - ctx.measureText(this.message).width / 2, this.y - 85);
			
		}
		}
}
