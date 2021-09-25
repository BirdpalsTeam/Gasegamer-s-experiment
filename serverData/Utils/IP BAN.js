let f = require('./profanity filter');
var b = 'yeah phrases are giving false positive';
//f.filter(b)
b = b.split(" ");
let badWords = false;
b.forEach(word => {
	if(f.filter(word) == true){
		badWords = true;
	}
});
if(badWords == true){
	console.log('bad words >:(')
}else{
	console.log('no bad words')
}