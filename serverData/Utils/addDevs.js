const fs = require('fs');
var devTeamJson = fs.readFileSync('./devTeam.json');
var devTeam = JSON.parse(devTeamJson);
const readline1 = require('readline').createInterface({
	input: process.stdin,
	output: process.stdout
});
var devName, devId;
readline1.question('Dev name: ', (answer) =>{
	console.log(answer);
	devName = answer;
	readline1.close();
	const readline2 = require('readline').createInterface({
		input: process.stdin,
		output: process.stdout
	})
	readline2.question('Dev Playfab id: ',(answer) => {
		console.log(answer);
		devId = answer;
		readline2.close();
		devTeam.devs.push({name: devName, id: devId});
		fs.writeFileSync('./devTeam.json', JSON.stringify(devTeam));
	})
})

//fs.writeFileSync('./devTeam.json', JSON.stringify(devTeam));