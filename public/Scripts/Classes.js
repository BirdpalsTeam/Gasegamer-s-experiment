class GameObject{
	constructor(img,sourceX,sourceY,sourceWidth,sourceHeight,x,y,width,height,originX,originY, id, mouseX, mouseY, lastX, lastY){
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
		this.id = id;
		this.mouseX = mouseX;
		this.mouseY = mouseY;
		this.lastX = lastX;
		this.lastY = lastY;
	}
		drawPlayer(){
		if(click == true && this.id == socket.id){
			this.moveAnim();
		}else if (this.id != socket.id){
			this.moveAnim();
		}
	
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
	
	
	
}