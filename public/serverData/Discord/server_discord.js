//Discord Bot
const Discord = require('discord.js');
const client = new Discord.Client();
exports.embedText = function embedText(who, message){
	return new Discord.MessageEmbed().addField(who, message);
}
let prefix = '!';
exports.startBot = () => {
	client.on('message' ,(message) =>{
		if (!message.content.startsWith(prefix) || message.author.bot) return;
		if(message.member.roles.cache.has('760901805436960800') || message.member.roles.cache.has('845072414048387102')){
			const args = message.content.slice(prefix.length).trim().split(/ +/);
			const command = args.shift().toLowerCase();
			let messageFromDiscord = server_utils.separateString(message.content);
			let timeOfBan = messageFromDiscord[1];
			let banPlayerName = messageFromDiscord[2];
			let reason = messageFromDiscord.slice(3,messageFromDiscord.length);
			reason = reason.toString().split(',').join(' '); //Returns the reason with spaces
			if(isNaN(timeOfBan) == true || banPlayerName == undefined || reason == undefined) {return message.channel.send(embedText('Error:', 'Command contains invalid parameters.').setColor('#FFFB00'));} //Check if the message is in correct form
			let banRequest;
	
			if(command == 'ban' && banPlayerName != undefined){
				server_utils.getPlayfabUserByUsername(banPlayerName).then(response =>{
					let banMessage = response.data.UserInfo.TitleInfo.DisplayName + ' was banned.';
					let banPlayerId = response.data.UserInfo.PlayFabId;
						if(timeOfBan === '9999'){	//Perma ban
							banRequest = {
								Bans: [{PlayFabId: banPlayerId, Reason: reason}]
							}
						}else{
							banRequest = {
								Bans: [{DurationInHours: timeOfBan, PlayFabId: banPlayerId, Reason: reason}]
							}
						}
						PlayFabServer.BanUsers(banRequest, (error, result) =>{	//Ban request to playfab
							if(result !== null){
								message.channel.send(embedText('Banned:', banMessage).setColor('#FF0000'))
							}else if(error !== null){
								console.log(error)
							}
						})
					}).catch(error =>{
						message.channel.send(embedText('Error:', error.errorMessage).setColor('#FFFB00'))
				});
	
			}
		}
		
	})
	//Start the discord bot
	client.login('ODM4NTQ3NTYxNTgwMzMxMDcw.YI8sRg.15hZCkAeqKpFqjMF2jds5Et7o9U');
}
exports.client = client;