
//use function to see if it is a bad word: filter('Hello world')
var blacklisted = ['abuse','abusing','anal','analbeads','ass','assfuck','asshole','bastard','bdsm','bitch','bisexual','bj','blowjob','buttplug','canabis','choke','choking','clit','clitoris','cocaine','cock','cuc','cum','cunt','dick','dickhead','dickmuncher','dicksucker','dildo','faggot','fanny','fannymonster','fannymuncher','fingering','fist','fisting','fuck','fucked','fucking','fuckton','fucktonne','führer','gobshite','ho','hoe','hitler','holocaust','kiddy','kiddyfiddler','kill','killing','marijuana','masochism','masochist','murder','murdering','nazi','naked','nigga','nob','nobhead','nobsucker','pedo','pedophile','penis','porn','pussy','pussymonster','pussymuncher','prick','rape','raping','rapist','sadism','sadist','sadomasochism','sex','sexual','sext','sexting','shit','shite','shithouse','shitting','slut','stab','stabbing','suck','swastica','swasticas','swastika','tits','titsucker','titty','tittyfidler','twat','twatmuncher','vagina','wank','wanker','weed','whore','wrist','wtf','4cking','gostosa','g0st0s0','puta','foda','caralho','pau','pênis','cu','buceta','porra','ninfeta','nudes','nua','pelada','bosta','merda']
var whitelisted = ['duck', 'asset','assert','sit','shut','birch', 'pens']


exports.filter = function filter(egg){
let banana = egg.toLowerCase().replace(/\s/g, '');

if((banana.includes('d') && banana.includes('ck') && !whitelisted.includes(banana))||(banana.includes('f') && banana.includes('ck') && !whitelisted.includes(banana))||(banana.includes('sh') && banana.includes('t') && !whitelisted.includes(banana))||(banana.includes('s') && banana.includes('it') && !whitelisted.includes(banana))||(banana.includes('s') && banana.includes('ut') && !whitelisted.includes(banana))||(banana.includes('b') && banana.includes('ch') && !whitelisted.includes(banana))||(banana.includes('d') && banana.includes('do') && !whitelisted.includes(banana))||(banana.includes('b') && banana.includes('st')  && banana.includes('rd') && !whitelisted.includes(banana))||((banana.includes('a') || banana.includes('@')) && banana.includes('n')  && banana.includes('nl') && !whitelisted.includes(banana))||(banana.includes('b') && banana.includes('w')  && banana.includes('j')&& banana.includes('b') && !whitelisted.includes(banana))||(banana.includes('f') && banana.includes('gg')&& !whitelisted.includes(banana))||((banana.includes('o') || banana.includes('0')) && banana.includes('h')  && banana.includes('e') && !whitelisted.includes(banana))||(banana.includes('n') && banana.includes('gger') && !whitelisted.includes(banana))||(banana.includes('b') && banana.includes('ch') && !whitelisted.includes(banana))||(banana.includes('b') && banana.includes('ch') && !whitelisted.includes(banana))||(banana.includes('h') && banana.includes('tt')&& banana.includes('er') && !whitelisted.includes(banana))||(banana.includes('n') && banana.includes('z') && !whitelisted.includes(banana))||(banana.includes('wh') && banana.includes('re') && !whitelisted.includes(banana))||(banana.includes('p') && banana.includes('n') && banana.includes('s') && !whitelisted.includes(banana))||blacklisted.includes(banana)){
//if a bad word is detected
console.log('bad word detected: ' + banana)
if(banana.includes('an')){console.log('possibly anal')}
if(banana.includes('as')){console.log('possibly ass')}
if(banana.includes('bi')){console.log('possibly bisexual or bitch')}
if(banana.includes('da')){console.log('possibly damn')}
if(banana.includes('di')){console.log('possibly dick')}
if(banana.includes('pe')){console.log('possibly penis')}
if(banana.includes('sh')){console.log('possibly shit')}
if(banana.includes('se')||banana.includes('s3')){console.log('possibly sex')}
if(banana.includes('nu')){console.log('possibly nude')}
if(banana.includes('n') && !banana.includes('u')){console.log('possibly nigger')}
if(!((banana.includes('n') && !banana.includes('u'))||banana.includes('nu')|| banana.includes('se') || banana.includes('s3')||banana.includes('sh')||banana.includes('pe')||banana.includes('d')||banana.includes('bi')||banana.includes('as')||banana.includes('an'))){console.log('you figure it out')}
return true;
}else{
	//if no bad word is found
	console.log('ok')
	}
	return false;
}

exports.whitelist = function whitelist(x){
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