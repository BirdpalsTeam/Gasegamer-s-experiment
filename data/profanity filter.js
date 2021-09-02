
//use function to see if it is a bad word: filter('Hello world')
function filter(egg){



var banana = egg.toLowerCase();
var blacklisted = ['abuse','abusing','anal','analbeads','ass','assfuck','asshole','bastard','bdsm','bitch','bisexual','bj','blowjob','buttplug','canabis','choke','choking','clit','clitoris','cocaine','cock','cuc','cum','cunt','dick','dickhead','dickmuncher','dicksucker','dildo','faggot','fanny','fannymonster','fannymuncher','fingering','fist','fisting','fuck','fucked','fucking','fuckton','fucktonne','führer','gobshite','ho','hoe','hitler','holocaust','kiddy','kiddyfiddler','kill','killing','marijuana','masochism','masochist','murder','murdering','nazi','naked','nigga','nob','nobhead','nobsucker','pedo','pedophile','penis','porn','pussy','pussymonster','pussymuncher','prick','rape','raping','rapist','sadism','sadist','sadomasochism','sex','sexual','sext','sexting','shit','shite','shithouse','shitting','slut','stab','stabbing','suck','swastica','swasticas','swastika','tits','titsucker','titty','tittyfidler','twat','twatmuncher','vagina','wank','wanker','weed','whore','wrist','wtf','4cking','gostosa','g0st0s0','puta','foda','caralho','pau','pênis','cu','buceta','porra','ninfeta','nudes','nua','pelada','bosta','merda']
var whitelisted = ['duck', 'asset','assert','sit','shut','birch', 'pens']

if((banana.includes('d') && banana.includes('ck') && !whitelisted.includes(banana)),(banana.includes('f') && banana.includes('ck') && !whitelisted.includes(banana)),(banana.includes('sh') && banana.includes('t') && !whitelisted.includes(banana)),(banana.includes('s') && banana.includes('it') && !whitelisted.includes(banana)),(banana.includes('s') && banana.includes('ut') && !whitelisted.includes(banana)),(banana.includes('b') && banana.includes('ch') && !whitelisted.includes(banana)),(banana.includes('d') && banana.includes('do') && !whitelisted.includes(banana)),(banana.includes('b') && banana.includes('st')  && banana.includes('rd') && !whitelisted.includes(banana)),((banana.includes('a') || banana.includes('@')) && banana.includes('n')  && banana.includes('nl') && !whitelisted.includes(banana)),(banana.includes('b') && banana.includes('w')  && banana.includes('j)&& banana.includes('b) && !whitelisted.includes(banana)),(banana.includes('f') && banana.includes('gg')&& !whitelisted.includes(banana)),((banana.includes('o') || banana.includes('0')) && banana.includes('h')  && banana.includes('e') && !whitelisted.includes(banana)),(banana.includes('n') && banana.includes('gger') && !whitelisted.includes(banana)),(banana.includes('b') && banana.includes('ch') && !whitelisted.includes(banana)),(banana.includes('b') && banana.includes('ch') && !whitelisted.includes(banana)),(banana.includes('h') && banana.includes('tt')&& banana.includes('er') && !whitelisted.includes(banana)),(banana.includes('n') && banana.includes('z') && !whitelisted.includes(banana)),(banana.includes('wh') && banana.includes('re') && !whitelisted.includes(banana)),(banana.includes('p') && banana.includes('n') && banana.includes('s') && !whitelisted.includes(banana))){
//if a bad word is detected
console.log('bad word')

}else{
	//if no bad word is found
	console.log('ok')
	}

}
