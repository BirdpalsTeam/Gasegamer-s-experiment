class State{
    constructor(){

    }

    onclick(evt){

    }
    onmousemove(evt){

    }

    main(){

    }

    render(){

    }
}

var allObjects;
class WorldState extends State{
    constructor(){
        super();
    }
	
    render(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        roomSprite.draw();
        allObjects = [];
        allObjects = playersObject.concat(roomObjects, localPlayer, roomNPCs);

        allObjects.sort(function(a, b){return a.y-b.y});

        allObjects.forEach((object) => {
            if(object != undefined){
                object.draw();
            }
        });

		foreground.draw();

        if(playersObject.length > 0){
            playersObject.forEach((player) => {
                player.whereToLook();
                player.drawUsername();
                player.drawBubble();
				if(player.card.isOpen == true){
					ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
					ctx.fillRect(0,0,canvas.width, canvas.height);
					player.card.draw();
				}
            });
        }

        if(roomNPCs != undefined && roomNPCs.length > 0){
            roomNPCs.forEach((npc)=>{
                npc.drawName();
            })
        }

        if(localPlayer != undefined){
			if(localPlayer.canDrawUsername == true){
				localPlayer.drawUsername();
			}
            localPlayer.drawBubble();
        }

		if(inventory != undefined && inventory.isOpen == true){
			ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
			ctx.fillRect(0,0,canvas.width, canvas.height);
			inventory.draw();
		}else{
			bioInput.hidden = true;
		}

        this.customrender();
    }

    customrender(){

    }

    onclick(evt){
        mousePos = getMousePos(canvas, evt);
        if(localPlayer != undefined && localPlayer.canMove == true){
            localPlayer.mouseX = mousePos.x;
            localPlayer.mouseY = mousePos.y;
            localPlayer.move();
			const playerMovement = {
				mouseX: mousePos.x,
				mouseY: mousePos.y
			}
			socket.emit('playerMovement', playerMovement);
		}else if(inventory != undefined && inventory.isOpen == true){
			inventory.close();
			inventory.selectItem();
			inventory.writeBio();
		}
	}

	onmousemove(evt){
		mouseOver = getMousePos(canvas, evt);
		if(inventory != undefined && inventory.isOpen == true){
			inventory.closeButton.isOverButton(mouseOver) == true ? inventory.closeButton.isOver = true : inventory.closeButton.isOver = false;
		}
	}
	
}

class TableTennisState extends State{
    constructor(){
        super();
        this.ballX = canvas.width/2;
        this.ballY = 0;
        this.ballVelX = 0;
        this.ballVelY = 10;
        this.ballGoingDown = true;

        let paddleSprite = loadSprite("Sprites/minigames/tabletennis/Paddle.png");
        let tableSprite = loadSprite("Sprites/minigames/tabletennis/table.png");
        this.player1Paddle = new Sprite(paddleSprite, 0, 0, 224, 245, 0, 400, 224, 245, 110, 0);
        this.table = new Sprite(tableSprite, 0, 0, 1000, 600, 0, 0, 1000, 600, 0, 0);
    }

    main(){
        if(this.ballGoingDown){
            if(this.ballY >= 500){
                this.ballGoingDown = false;
                this.ballVelY *= -1
            }
        }
        else{

        }

        this.ballX += this.ballVelX;
        this.ballY += this.ballVelY;
    }

    render(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.table.draw();
        var c = document.getElementById("myCanvas");
        ctx.beginPath();
        ctx.arc(this.ballX, this.ballY, 10, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
        this.player1Paddle.draw();
    }

    onmousemove(evt){
        let tempMousePos = getMousePos(canvas, evt);
        this.player1Paddle.x = tempMousePos.x;
    }
}

class BirdInvadersState extends State{
    constructor(){
        super();

        let machineimg = new Image();
        machineimg.src = "Sprites/minigames/BirdInvaders/machine.png";
        this.machineSprite = new Sprite(machineimg, 0, 0, 1000, 600, 0, 0, 1000, 600, 0, 0);
        let buttonsimg = new Image();
        buttonsimg.src = "Sprites/minigames/BirdInvaders/buttons.png";
        this.buttonsSprite = new Sprite(buttonsimg, 0, 0, 1000, 600, 0, 0, 1000, 600, 0, 0);

        this.customplayer = {x:100, y:100, width:82, height:110, username:"", id:"", bio:"", items:[], mouseX:0, mouseY:0, isDev:false, isMoving:false};

        this.player = new Player(this.customplayer);
        this.player.img.src = "Sprites/minigames/BirdInvaders/Birds/pixel_blue.png";

        collisionArray = [];
    }

    render(){
        ctx.clearRect(0,0,canvas.width,canvas.height);

        this.machineSprite.draw();
        this.player.draw();
        this.buttonsSprite.draw();
    }

    onclick(evt){
        mousePos = getMousePos(canvas, evt);
        if(this.player != undefined && this.player.canMove == true){
            this.player.mouseX = mousePos.x;
            this.player.mouseY = mousePos.y;
            this.player.move();
			const playerMovement = {
				mouseX: mousePos.x,
				mouseY: mousePos.y
			}
		}else if(inventory != undefined && inventory.isOpen == true){
			inventory.close();
			inventory.selectItem();
			inventory.writeBio();
		}
	}
}


//Debug States

class DebugWorldState extends WorldState{
    constructor(){
        super();
    }

    onclick(evt){
        mousePos = getMousePos(canvas, evt);
        if(localPlayer != undefined){
            localPlayer.mouseX = mousePos.x;
            localPlayer.mouseY = mousePos.y;
            localPlayer.move();
        }
        const playerMovement = {
            mouseX: mousePos.x,
            mouseY: mousePos.y
        }
        socket.emit('playerMovement', playerMovement);

        debugParagraph.innerHTML = "mouse X: " + mousePos.x.toString() + " mouse Y: " + mousePos.y.toString();
    }

    customrender(){
        drawCollisionMap();
    }
}

class DebugRoomState extends State{
    constructor(roombackgroundsrc, roomdetailssrc){
        super();
        
        this.roombackgroundimg = new Image();
        this.roombackgroundimg.src = roomsSrc + roombackgroundsrc;

        this.roomdetailsimg = new Image();
        this.roomdetailsimg.src = roomsSrc + roomdetailssrc;

        this.tempmousepos = {x:0,y:0};
        this.currentclick = 0;
        this.click1 = [0, 0];
        this.click2 = [0, 0];
        this.click3 = [0, 0];
    }

    render(){
        ctx.clearRect(0,0,canvas.width,canvas.height);

        ctx.drawImage(this.roombackgroundimg, 0, 0);
        ctx.drawImage(this.roomdetailsimg, 0, 0);

        if(this.currentclick == 0){
            ctx.beginPath();
            ctx.rect(this.tempmousepos.x, this.tempmousepos.y, 10, 10);
            ctx.stroke();
        }
        else if(this.currentclick == 1){
            ctx.beginPath();
            ctx.rect(this.click1[0], this.click1[1], this.tempmousepos.x - this.click1[0], this.tempmousepos.y - this.click1[1]);
            ctx.stroke();
        }
        else if(this.currentclick == 2){
            ctx.beginPath();
            ctx.rect(this.click1[0], this.click1[1], this.click2[0], this.click2[1]);
            ctx.rect(this.tempmousepos.x, this.tempmousepos.y, 10, 10);
            ctx.stroke();
        }
    }

    onmousemove(evt){
        this.tempmousepos = getMousePos(canvas, evt);
        ctx.lineWidth = "1";
    }

    onclick(evt){
        let objectString = "";
        if(this.currentclick == 0){
            this.click1 = [this.tempmousepos.x, this.tempmousepos.y];
        }
        else if(this.currentclick == 1){
            this.click2 = [this.tempmousepos.x - this.click1[0], this.tempmousepos.y - this.click1[1]];
        }
        else if(this.currentclick == 2){
            this.click3 = [this.tempmousepos.x - this.click1[0], this.tempmousepos.y - this.click1[1]];
            objectString = "["+this.click1[0].toString()+","+this.click1[1].toString()+","+this.click2[0].toString()+","+this.click2[1].toString()+","+this.click3[0].toString()+","+this.click3[1].toString()+"]";

            console.log(objectString);

        }
        else if(this.currentclick == 3){
            this.currentclick = -1;
            this.click1 = [0, 0];
            this.click2 = [0, 0];
            this.click3 = [0, 0];
        }

        this.currentclick += 1;
    }
}

class DebugSkinEditorState extends State{
    constructor(skinimg){
        super();
        
        this.itemimg = skinimg;
        this.click1 = [0,0];
        this.click2 = [0,0];
        this.currentclick = 0;

        this.spritesArray = [];

        this.drawSpritesheetthingy();
    }

    drawSpritesheetthingy() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(this.itemimg, 0, 0);
    }

    onclick(evt){
        let tempmousepos = getMousePos(canvas, evt);
        if(this.currentclick == 0){
            this.click1 = [this.tempmousepos.x, this.tempmousepos.y];
            this.currentclick = 1;
            this.drawSpritesheetthingy();
        }
        else if(this.currentclick == 1){
            this.click2 = [this.tempmousepos.x - this.click1[0], this.tempmousepos.y - this.click1[1]];
            this.currentclick = 2;
            //ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.rect(this.click1[0], this.click1[1], this.click2[0], this.click2[1]);
            ctx.stroke();
        }
        else if(this.currentclick == 2){
            ctx.rect(0,0,canvas.width,canvas.height);
            ctx.fill();
            ctx.stroke();
            ctx.drawImage(this.itemimg,this.click1[0],this.click1[1],this.click2[0], this.click2[1],10,10, this.click2[0], this.click2[1]);

            debugParagraph.innerHTML = this.click1[0].toString() + "," + this.click1[1].toString() + "," + (this.click2[0]).toString() + "," + (this.click2[1]).toString();
            this.currentclick = 3;
        }
        else{
			this.spritesArray.push([this.click1[0],this.click1[1],this.click2[0], this.click2[1], canvas.width / 2 - this.tempmousepos.x, canvas.height/2 - this.tempmousepos.y]);
            this.currentclick = 0;
            this.drawSpritesheetthingy();
        }
    }
    onmousemove(evt){
        this.tempmousepos = getMousePos(canvas, evt);
        ctx.lineWidth = "1";
        if(this.currentclick == 0){
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.drawSpritesheetthingy();
            ctx.beginPath();
            ctx.rect(this.tempmousepos.x, this.tempmousepos.y, 10, 10);
            ctx.stroke();
        }
        else if(this.currentclick == 1){
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.drawSpritesheetthingy();
            ctx.beginPath();
            ctx.rect(this.click1[0], this.click1[1], this.tempmousepos.x - this.click1[0], this.tempmousepos.y - this.click1[1]);
            ctx.stroke();
        }
        else if(this.currentclick > 2){
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(this.itemimg,this.click1[0],this.click1[1],this.click2[0], this.click2[1],this.tempmousepos.x,this.tempmousepos.y, this.click2[0], this.click2[1]);

            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, 5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        }
    }

    finishUp(){
        let spriteArrayString = "";
        this.spritesArray.forEach(sprite =>{
            spriteArrayString += '['+ sprite +'],';
        });
        debugParagraph.innerHTML = '"SkinName": [' + spriteArrayString + ']';
    }
}
