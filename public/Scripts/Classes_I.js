class Inventory extends Sprite{
	constructor(img, layer, type){
		super(img, 0, 0, 892, 512, 0, 0, 1000, 600, layer, type);
		this.layer = layer;
		this.type = type;
		this.isOpen = false;
		this.closeButton = new Button(870, 30, 65, 86);
		this.bioButton = new Button(355, 505, 60, 50);
		this.isChanging = false;
		this.bigBird = {x: this.x + 150, y: this.y + 150};
		this.bigBird.img = new Image();
		this.bigBird.shadowImg = new Image();
		this.bigBird.img.src = hudSrc + "big_bird.png";
		this.bigBird.shadowImg.src = hudSrc + 'big_bird_shadow.png';
		this.canDrawBigBird = false;
		this.canDrawGrid = true;
		this.canDrawBio = false;
	}

	open(){
		if(this.isOpen == false){
			this.isChanging == false ? this.getInventory() : this.createItemsButtons();
			this.isOpen = true;
			localPlayer.canMove = false;
			this.canDrawBigBird = false;
			this.canDrawGrid = true;
			this.canDrawBio = false;
		}
	} 

	close(){
		if(this.closeButton.isInsideButton(mousePos) == true){
			this.isChanging = true;
			command('/updateInventory', this.items);
			this.updateGear();
			this.isOpen = false;
			this.bioButton.isSelected = false;
			localPlayer.canMove = true;
		}
	}

	getInventory(){
		PlayFabClientSDK.GetUserInventory({SessionTicket: sessionStorage.ticket}, (result, error) =>{
			if(result !== null){
				this.items = result.data.Inventory;
				this.createItemsButtons();
			}else if(error !== null){
				console.log(error);
			}
		})
	}

	createItemsButtons(){
		let pastX = 513;
		let pastY = 132;
		for(let i = 0; i < this.items.length; i++){
			if(i % 4 == 0 && i != 0){
				pastX = 507;
				pastY += 77.5;
			}
			this.items[i].button = new Button(pastX, pastY, 85, 77.5);
			if(this.items[i].CustomData.isEquipped == 'true') this.items[i].button.isSelected = true;
			pastX += 95;
		}
		this.canDrawItems = true;
	}

	updateGear(){
		localPlayer.items = this.items;
		localPlayer.itemsImgs = new Array();
		let colors = new Array();
		localPlayer.items.forEach((item) => {
			if(item.CustomData.isEquipped == 'true'){
				localPlayer.addItem(item.ItemClass, item.ItemId);
			}
			if(item.ItemClass == 'color'){
				let colorItem = {ItemId: item.ItemId, isEquipped: item.CustomData.isEquipped}
				colors.push(colorItem);
			}
		})
		if(getElementFromArrayByValue('true', 'isEquipped', colors) == false){
			let tempCharacterImg = new Image();
			tempCharacterImg.src = charactersSrc + "bird_blue.png";
			localPlayer.img = tempCharacterImg;
			localPlayer.img.name = 'bird_blue';
		}
	}

	drawSquares(pastX, pastY, squareHeight, array, callback){
		for(let i = 0; i < array.length; i++){
			if(i % 4 == 0 && i != 0){
				pastX = 511;
				pastY += squareHeight;
			}
			callback(array, i, pastX, pastY);
			pastX += 95;
		}
	}

	drawItems(items, i, pastX, pastY){
		items[i].img = new Image();
		items[i].img.src = itemsSrc + items[i].ItemClass + "/" + items[i].ItemId + "_icon.png";
		ctx.fillStyle = "#bab6aa";
		ctx.fillRect(pastX - 4, pastY, 95, 85); //draws the grey rectangle
		ctx.drawImage(items[i].img, pastX, pastY + 2);
		
		if(items[i].button.isSelected == true){
			ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
			ctx.fillRect(pastX - 4, pastY - 3, 95, 85); //draws the grey rectangle
		}

		items[i].button.isOverButton(mouseOver) == true ? items[i].button.isOver = true : items[i].button.isOver = false;

		if(items[i].button.isOver == true){
			ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
			ctx.fillRect(pastX - 4, pastY, 95, 85); //draws the grey select rectangle
		}
	}

	selectItem(){
		this.items.forEach(item =>{
			item.button.isInsideButton(mousePos);
			if(item.button.isSelected == true){
				item.CustomData.isEquipped = "true";
				this.items.forEach(fItem =>{
					if(fItem.ItemClass == item.ItemClass && fItem.ItemId != item.ItemId && fItem.CustomData.isEquipped == "true"){
						fItem.CustomData.isEquipped = "false";
						fItem.button.isSelected = false;
					}
				})
			}else{
				item.CustomData.isEquipped = "false";
			}
		})
	}

	drawGrid(){
		let pastX = 507;
		let pastY = 127;
		let squareWidth = 95;
		let squareHeight = 87.5;
		for(let i = 0; i < 16; i++){
			if(i % 4 == 0 && i != 0){
				pastX = 507;
				pastY += squareHeight;
			}
			ctx.beginPath();
			ctx.rect(pastX, pastY, squareWidth, squareHeight);
			ctx.strokeStyle = "black";
			ctx.stroke();
			pastX += 95;
		}
	}

	drawWhiteRectangle(){
		if(this.canDrawItems == true){
			let pastX = 511;
			let pastY = 130;
			for(let i = 0; i < this.items.length; i++){
				if(i % 4 == 0 && i != 0){
					pastX = 511;
					pastY += 87.5;
				}
				if(this.items[i].button.isSelected == true){
					ctx.beginPath();
					ctx.strokeStyle = "white";
					ctx.lineWidth = 6;
					ctx.rect(pastX - 4, pastY - 3.2, 95, 87.5); //draws the white rectangle
					ctx.stroke();
				}
				pastX += 95;
			}
		}
	}
	
	grayCloseButton(){
		ctx.fillStyle = "rgba(0, 0, 0, 0.4)"
		ctx.beginPath();
		ctx.moveTo(this.closeButton.x, this.closeButton.y);
		ctx.lineTo(this.closeButton.x + 66,this.closeButton.y);
		ctx.lineTo(this.closeButton.x + 70, 100);
		ctx.fill();
		ctx.beginPath();
		ctx.moveTo(this.closeButton.x, this.closeButton.y);
		ctx.bezierCurveTo(this.closeButton.x, this.closeButton.y + 15,this.closeButton.x + 35, this.closeButton.y + 60, this.closeButton.x + 70, 100);
		ctx.fill();
	}

	drawBigBird(){
		ctx.drawImage(this.bigBird.shadowImg, this.bigBird.x, this.bigBird.y + 230);
		ctx.drawImage(this.bigBird.img, this.bigBird.x, this.bigBird.y);
		this.bigBird.items = this.items;
		this.bigBird.gear = new Array();
		this.bigBird.colors = new Array();
		this.bigBird.items.forEach(item =>{
			if(item.button.isSelected == true){
				item.img = new Image();
				item.img.src = itemsSrc + item.ItemClass + '/' + item.ItemId + '_big.png';
				let imgX, imgY, imgLayer;
				let canPush = false;
				switch(item.ItemClass){
					case 'hand':
						imgX = this.bigBird.x;
						imgY = this.bigBird.y;
						canPush = true
						imgLayer = 6;
						break;
					case 'head':
						imgX = this.bigBird.x + 14;
						imgY = this.bigBird.y - 14;
						canPush = true;
						imgLayer = 5;
						break;
					case 'face':
						imgX = this.bigBird.x + 30;
						imgY = this.bigBird.y + 47;
						canPush = true;
						imgLayer = 4;
						break;
					case 'neck':
						imgX = this.bigBird.x + 75;
						imgY = this.bigBird.y + 150;
						canPush = true
						imgLayer = 3;
						break;
					case 'body':
						imgX = this.bigBird.x;
						imgY = this.bigBird.y;
						canPush = true
						imgLayer = 2;
						break;
					case 'feet':
						imgX = this.bigBird.x;
						imgY = this.bigBird.y;
						canPush = true
						imgLayer = 1;
						break;
					case 'color':
						this.bigBird.img.src = item.img.src;
						this.bigBird.colors.push(item);
						canPush = false;
						imgLayer = 0;
						break;
				}
				if(canPush == true){this.bigBird.gear.push({i: item.img, x: imgX, y: imgY, layer: imgLayer});}
			}
		})
		this.bigBird.gear.sort((b, a) => {return b.layer - a.layer});
		this.bigBird.gear.forEach((item) =>{
			ctx.drawImage(item.i, item.x, item.y);
		})
		if(this.bigBird.colors.length > 0){
			this.bigBird.colors.forEach((item)=>{
				if(item.button.isSelected == false){
					removeElementFromArray(item, this.bigBird.colors);
				}
			})
		}else{
			this.bigBird.img.src = hudSrc + "big_bird.png";
		}
	}

	drawUsername(){
		if(localPlayer.username.length > 16){
			ctx.font = '46px Caslon';
		}else{
			ctx.font = '55px Caslon';
		}
		ctx.fillStyle = '#615f5b';
		ctx.fillText(localPlayer.username, this.x + 260, this.y + 80);
	}

	writeBio(){
		this.bioButton.isInsideButton(mousePos);
		if(this.bioButton.isSelected == true){
			this.canDrawItems = false;
			this.canDrawGrid = false;
			this.canDrawBio = true;
			this.saveBio();
			bioInput.hidden = false;
			if(localPlayer.bio != "I like to play Birdpals!"){
				bioInput.value = localPlayer.bio;
			}
		}else{
			this.canDrawItems = true;
			this.canDrawGrid = true;
			this.canDrawBio = false;
			bioInput.hidden = true;
			bioInput.disabled = false;
		}
	}
	saveBio(){
		bioInput.onkeyup = function(evt) {
            evt = evt || window.event;

            if (evt.keyCode == 13) {
				 bioInput.disabled = true;
				 command('/changeBio', bioInput.value);
				 localPlayer.bio = bioInput.value;
            }
        };
	}
	customDraw(){
		try {
			if(this.isOpen == true){
				if(this.closeButton.isOver == true){
					this.grayCloseButton();
				}
				if(this.canDrawItems == true && this.canDrawBio == false){
					this.drawSquares(511, 130, 87, this.items, this.drawItems);
					this.canDrawBigBird = true;
				}
				if(this.canDrawBigBird == true){
					this.drawBigBird();
				}
				this.drawUsername();
				if(this.canDrawGrid == true){
					this.drawGrid();
				}
				if(this.canDrawBio == true){
					ctx.beginPath();
					ctx.rect(507, 130, 380, 350);
					ctx.strokeStyle = "black";
					ctx.stroke();
				}
				this.drawWhiteRectangle();
			}
		} catch (error) {
			console.error(error)
		}
		
	}
}