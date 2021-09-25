var NoSwearing = require('noswearing').NoSwearing;
const LanguageDetect = require('languagedetect');
const lngDetector = new LanguageDetect();
lngDetector.setLanguageType('iso2');
var naughtyWords = require('naughty-words');

function checker(text, language){
	let noSwear = new NoSwearing(JSON.parse(require("fs").readFileSync("./profanity_words.json", "utf8"))[language]);
	return noSwear.check(text);
}

function profanity(sentence){
	sentence = sentence.toLowerCase().replace(/[^\w\s]/gi, '');
	let isBadword = false;

	lngDetector.detect(sentence, 7).forEach(element => {
		let language = element[0];
		if(Object.keys(naughtyWords).includes(language) == true){ //Check if there is a profanity word list for this language
			let result = checker(sentence, language)[0];
			console.log(result, language)
			if(result !== undefined && result.info == 2){
				isBadword = true;
			}
		}else{
			let result = checker(sentence, 'en')[0];
			if(result === undefined) return;
			result.info == 2 ? isBadword = true : isBadword = false; //Garantee that is not an english bad word
		}
	});
	return isBadword == true ? true : false;
}
profanity('C@ralho') == true ? console.log('palavrão detectado') : console.log('ta safe ')