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

class WorldState extends State{
    constructor(){
        super();
    }

    render(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        roomSprite.draw();
        let allObjects = [];
        allObjects = playersObject.concat(background, foreground);
        allObjects.push(localPlayer);

        allObjects.sort(function(a, b){return a.y-b.y});

        allObjects.forEach((object) => {
            if(object != undefined){
                object.draw();
            }
        });

        if(playersObject.length > 0){
            playersObject.forEach((player) => {
                player.whereToLook();
                player.drawUsername();
                player.drawBubble();
            });
        }

        if(localPlayer != undefined){
            localPlayer.drawUsername();
            localPlayer.drawBubble();
        }
		if(inventory != undefined && inventory.isOpen == true){
			inventory.draw();
		}
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
}

class DebugWorldEditorStateSpritesheet extends State{
    constructor(){
        super();

        this.cutobjectsx = 0;
        this.cutobjectsy = 0;
        this.cutobjectswidth = 0;
        this.cutobjectsheight = 0;
        this.cutobjectoriginx = 0;
        this.cutobjectoriginy = 0;

        this.camX = 0;
        this.camY = 0;

        this.roomediting = "";
        this.spritesheetediting = "";

        this.roomediting = prompt("Enter Room You want to edit");
        this.spritesheetediting = "Sprites/rooms/" + prompt("Enter Spritesheet to use");
        this.roomImage = new Image();
        this.roomImage.src = this.spritesheetediting;
    }

    render(){
		ctx.clearRect(0,0,canvas.width,canvas.height);
    }

    onclick(evt){
        
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
            this.click1 = [tempmousepos.x, tempmousepos.y];
            this.currentclick = 1;
            this.drawSpritesheetthingy();
        }
        else if(this.currentclick == 1){
            this.click2 = [tempmousepos.x, tempmousepos.y];
            this.currentclick = 2;
            //ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.rect(this.click1[0], this.click1[1], this.click2[0] - this.click1[0], this.click2[1] - this.click1[1]);
            ctx.stroke();
        }
        else if(this.currentclick == 2){
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.rect(0,0,canvas.width,canvas.height);
            ctx.fill();
            ctx.stroke();
            ctx.drawImage(this.itemimg,this.click1[0],this.click1[1],this.click2[0] - this.click1[0], this.click2[1] - this.click1[1],10,10, this.click2[0] - this.click1[0], this.click2[1] - this.click1[1]);

            debugParagraph.innerHTML = this.click1[0].toString() + "," + this.click1[1].toString() + "," + (this.click2[0] - this.click1[0]).toString() + "," + (this.click2[1] - this.click1[1]).toString();
            this.currentclick = 3;
        }
        else{
            this.spritesArray.push([this.click1[0],this.click1[1],this.click2[0] - this.click1[0], this.click2[1] - this.click1[1], canvas.width / 2 - tempmousepos.x, canvas.height/2 - tempmousepos.y]);
            this.currentclick = 0;
            this.drawSpritesheetthingy();
        }
    }
    onmousemove(evt){
        if(this.currentclick > 2){
            let tempmousepos = getMousePos(canvas, evt);
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(this.itemimg,this.click1[0],this.click1[1],this.click2[0] - this.click1[0], this.click2[1] - this.click1[1],tempmousepos.x,tempmousepos.y, this.click2[0] - this.click1[0], this.click2[1] - this.click1[1]);
            
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