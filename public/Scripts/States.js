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

    end(){

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

        playersObject.forEach((tempplayer) =>{
            if(tempplayer.card != undefined && tempplayer.card.playerButton.isInsideButton(mousePos) == true && tempplayer.card.isOpen == false){
                if(localPlayer.isMoving == true){
                    localPlayer.isMoving = false;
                    clearInterval(localPlayer.movePlayerInterval);
                }
                tempplayer.card.open();
            }else if(tempplayer.card != undefined && tempplayer.card.closeButton.isInsideButton(mousePos) == true && tempplayer.card.isOpen == true){
                tempplayer.card.close();
            }
        });
	}

	onmousemove(evt){
		mouseOver = getMousePos(canvas, evt);
		if(inventory != undefined && inventory.isOpen == true){
			inventory.closeButton.isOverButton(mouseOver) == true ? inventory.closeButton.isOver = true : inventory.closeButton.isOver = false;
		}
	}
	
}

class JukeboxState extends State{
    constructor(){
        super();
        this.tracks = [];
        customGetJSON(JSONSrc + 'jukeboxJSON.json').then(response =>{
            this.jukeboxJSON = response;
            for(let i in this.jukeboxJSON){
                this.tracks.push([this.jukeboxJSON[i].name, this.jukeboxJSON[i].purpose, this.jukeboxJSON[i].author, this.jukeboxJSON[i].file]);
            }
        })
        stopMusic();
    }

    render(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for(let i = 0; i < this.tracks.length; i++){
            ctx.beginPath();
            ctx.lineWidth = "6";
            ctx.strokeStyle = "black";
            ctx.rect(10, 10+i*110, 400, 100);
            ctx.stroke();
            ctx.fillStyle = "white";
            ctx.fill();
            ctx.fillStyle = "black";
            ctx.textAlign = "left";
            ctx.font = "30px Arial";
            ctx.fillText(this.tracks[i][0], 20, 40+i*110);
            ctx.font = "20px Arial";
            ctx.fillText(this.tracks[i][1], 20, 100+i*110);
            ctx.fillText(this.tracks[i][2], 200, 100+i*110);
        }
        ctx.beginPath();
        ctx.lineWidth = "6";
        ctx.strokeStyle = "black";
        ctx.rect(900, 10, 90, 50);
        ctx.stroke();
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.font = "20px Arial";
        ctx.fillText("Back", 920, 40);
    }

    onclick(evt){
        let mousePos = getMousePos(canvas, evt);
        if(mousePos.x <= 990 && mousePos.x >= 900 && mousePos.y <= 60 && mousePos.y >= 10){
            currentState = new WorldState();
            background_music.src = audioSrc + rooms[currentRoom].music;
		    currentMusicSrc = audioSrc + rooms[currentRoom].music;
            return;
        }
        for(let i = 0; i < this.tracks.length; i++){
            if(mousePos.x <= 400 && mousePos.x >= 10 && mousePos.y <= 10+i*110+100 && mousePos.y >= 10+i*110){
                let src = this.tracks[i][3];
                background_music.src = audioSrc + src;
		        currentMusicSrc = audioSrc + src;
                return;
            }
        }
    }
}

class TableTennisState extends State{
    constructor(){
        super();

        this.ballVelX = 5;
        this.ballVelY = 5;
        this.ballGoingDown = true;
        this.ball = new Shape(canvas.width/2,0,50,50,"blue");

        this.paddleWidth = 200;
        this.paddleHeight = 200;
        this.player1Paddle = new Shape(canvas.width / 2 - this.paddleWidth / 2,canvas.height - this.paddleHeight,this.paddleWidth,this.paddleHeight,"red");
    }

    main(){
        if(this.ballGoingDown){
            if(this.ball.y >= canvas.height - this.paddleHeight/2){
                if(this.ball.x >= this.player1Paddle.x && this.ball.x <= this.player1Paddle + this.paddleWidth){
                    this.ballGoingDown = false;
                    this.ballVelY *= -1;
                }
            }
        }
        else{
            if(this.ball.y <= this.paddleHeight/2){
                this.ballGoingDown = true;
                this.ballVelY *= -1;
            }
        }
        if(this.ball.x <= 0 || this.ball.x >= canvas.width){
            this.ballVelX *= -1;
        }

        this.ball.x += this.ballVelX * timeScale;
        this.ball.y += this.ballVelY * timeScale;
    }

    render(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        this.player1Paddle.draw();
        this.ball.draw();
    }

    onclick(evt){
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

class DebugItemEditorState extends State{
    constructor(itemimg, skininfo){
        super();
        
        this.itemimg = itemimg;
        this.skininfo = skininfo;
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