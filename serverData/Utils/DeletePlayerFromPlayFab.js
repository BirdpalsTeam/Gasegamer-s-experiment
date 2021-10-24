var server_utils = require('./server-utils');
let {PlayFabAdmin} = require('playfab-sdk');

server_utils.getPlayersInSegment("1B7192766262CE36").then(console.log).catch(console.log);

//PlayFabAdmin.DeleteMasterPlayerAccount({PlayFabId: "42E4C4B077FA3A97"}, (error, result) =>{	console.log(result)}) 
setInterval(()=>{}, 1000/60);