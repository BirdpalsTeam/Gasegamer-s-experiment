class State{
    constructor(){

    }

    onclick(evt){

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
        allObjects = playersObject.concat(details);
        allObjects.push(localPlayer);

        allObjects.sort(function(a, b){return b.y-a.y});

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

class WorldEditorStateSpritesheet extends State{
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
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
    }

    onclick(evt){
        
    }
}