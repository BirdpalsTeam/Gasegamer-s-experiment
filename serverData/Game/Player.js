exports.Player = class Player{
	constructor(id, username, items=[], biography, friends=[]){
		this.id = id;
		this.username = username;
		this.x = 500;
		this.y = 460;
		this.width = 82;
		this.height = 110;
		this.isMoving = false;
		this.mouseX = 500;
		this.mouseY = 460;
		this.message = "";
		this.movePlayerInterval;
		this.isDev = false;
		this.items = items;
		this.bio = biography;
		this.friends = friends;
	}
	move(room){
		this.isMoving = true;
		let dx = this.mouseX - this.x;
		let dy = this.mouseY - this.y;
		
		let angleToMove = Math.atan2(dy,dx);

		let speed = 4;

		let velX = Math.cos(angleToMove) * speed;
		let velY = Math.sin(angleToMove) * speed;
		let timeToPlayerReachDestination = Math.floor(dx/velX);

		let roomCollMapX = room.roomCollMapX;
		let roomCollMapY = room.roomCollMapY;
		let roomCollCellWidth = 800 / roomCollMapX;
		let roomCollCellHeight = 500 / roomCollMapY;
		let collisionArray = room.collision;
		let collided;

		this.movePlayerInterval = setInterval(() => {
			for(let i = 0; i < collisionArray.length; i+=2){
				if(timeToPlayerReachDestination <= 0) return collided = true;
				
				if(this.x + velX <= collisionArray[i] + roomCollCellWidth && this.x + velX >= collisionArray[i]){
					if(this.y + velY <= collisionArray[i + 1] + roomCollCellHeight && this.y + velY >= collisionArray[i + 1]){
						this.isMoving = false;
						clearInterval(this.movePlayerInterval);
						return collided = true;
					}
				}
			}
			this.x += velX;
			this.y += velY;

			timeToPlayerReachDestination--;
			if(timeToPlayerReachDestination <= 0){
				this.isMoving = false;
				clearInterval(this.movePlayerInterval);
			}
		}, 1000 / 60);	
	}
}