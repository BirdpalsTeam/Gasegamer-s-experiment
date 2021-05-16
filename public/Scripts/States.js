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