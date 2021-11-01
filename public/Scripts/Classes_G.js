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
	draw(){
		bg_ctx.clearRect(0, 0, bg_canvas.width, bg_canvas.height);
		bg_ctx.drawImage(this.img,this.sourceX,this.sourceY,this.sourceWidth,this.sourceHeight,this.x - this.originX, this.y - this.originY, this.width, this.height);
		this.customDraw();
	}

	customDraw(){

	}
}

class Room_Details extends Sprite{
	constructor(img, layer, type, width, height){
		super(img, 0, 0, 892, 512, 0, 0, width, height, layer, type);
		this.layer = layer;
		this.type = type;
	}
	draw(){
		fg_ctx.clearRect(0, 0, fg_canvas.width, fg_canvas.height);
		fg_ctx.drawImage(this.img,this.sourceX,this.sourceY,this.sourceWidth,this.sourceHeight,this.x - this.originX, this.y - this.originY, this.width, this.height);
		this.customDraw();
	}
}