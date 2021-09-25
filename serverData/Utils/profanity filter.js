var {NoSwearing, dict} = require('noswearing');
const {detectAll} = require('tinyld');
var profanityJson = JSON.parse(require("fs").readFileSync("./serverData/Utils/profanity_words.json", "utf8"));
let booyer = require('./booyer_moore_algorythm').booyerMoore;

function checker(text, language){
	let noSwear = new NoSwearing(profanityJson[language]);
	return noSwear.check(text);
}

function booyerCheck(sentence, language){ //Algorythm to find patterns at text
	let found = false;
	Object.keys(profanityJson[language]).forEach(word =>{
		if(booyer(sentence, word) == true){
			found = true;
		}
	})
	return found == true ? true : false;
}

exports.filter = function profanity(sentence){
	sentence = sentence.toLowerCase() + ' a'; //Makes, for some reason, easier to detect the language
	let isBadword = false;
	detectAll(sentence).forEach(possibility =>{
		let language = possibility.lang;	//Return the language as iso2 format
		let originalSentence = sentence.slice(0, -2); //Removes the " a"
		if(Object.keys(profanityJson).includes(language) == true){ //Check if there is a profanity word list for this language
			let result = checker(originalSentence, language)[0]; //Check if there is a bad word by spelling
			if(result != undefined && result.info == 2){
				isBadword = true;
			}else if(originalSentence.split(" ").length == 1){ //There is no space in the sentence
				for(let letter in dict){
					dict[letter].forEach(fakeLetter =>{
						if(originalSentence.includes(fakeLetter) == true){
							originalSentence = originalSentence.replace(fakeLetter, letter); //Words like "@ss" will become "ass"
						}
					})
				}
				if(booyerCheck(originalSentence, language) == true){ //Check if there is a badword in a sentence that doesn't have space
					isBadword = true;
				} 
			}
		}else if(isBadword == false){
			let result = checker(originalSentence, 'en')[0];
			if(result !== undefined && result.info == 2){ //Garantee that is not an english bad word
				isBadword = true;
			}
		}
	})
	return isBadword == true ? true : false;
}

exports.whitelist = function whitelist(x, language){
	whitelisted.push(x)
	console.log('Whitelist added '+ x)
}
exports.blacklist = function blacklist(x){
	blacklisted.push(x)
	console.log('Blacklist added '+ x)
}
exports.blacklistUndo = function blacklistUndo(){
	console.log(blacklisted.slice(-1)[0]+' was removed from blacklist')
	blacklisted.pop();
	
}
exports.whitelistUndo = function whitelistUndo(){
	console.log(whitelisted.slice(-1)[0]+' was removed from blacklist')
	whitelisted.pop();
	
}
exports.blacklistRemove = function blacklistRemove(w){
	var w = w.toLowerCase();
	console.log(blacklisted.indexOf(w) + ': '+ w +' was removed from blacklist')
	blacklisted.splice(blacklisted.indexOf(w))
}
exports.whitelistRemove = function whitelistRemove(w){
	var w = w.toLowerCase();
	console.log(whitelisted.indexOf(w) + ': '+ w +' was removed from whitelist')
	whitelisted.splice(whitelisted.indexOf(w))
	
}