class Shape{
    constructor(x,y,width,height,colour){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.colour = colour;
    }

    draw(){
        ctx.beginPath();
        ctx.fillStyle = this.colour;
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fill();
    }
}

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

class Item extends Sprite{
	constructor(img, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height, originX, originY, layer, type, name){
		super(img, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height, originX, originY);
		this.layer = layer;
		this.type = type;
		this.name = name;
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