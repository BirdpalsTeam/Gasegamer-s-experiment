//Server
var compression = require('compression');
var express = require('express');
var helmet = require('helmet');
var app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http,{
	cors: {
		origin: "https://localhost:*",
		methods: ["GET", "POST"]
	  }
  });
const server_socket = require('./serverData/Game/server_socket');
//Playfab
var PlayFab = require("./node_modules/playfab-sdk/Scripts/PlayFab/PlayFab");
var PlayFabClient = require("./node_modules/playfab-sdk/Scripts/PlayFab/PlayFabClient");
const { PlayFabServer, PlayFabAdmin } = require('playfab-sdk');
var GAME_ID = '238E6';
PlayFab.settings.titleId = GAME_ID;
PlayFab.settings.developerSecretKey = 'KYBWN8AEATIQDEBHQTXUHS3Z5ZKWSF4P3JTY5HD9COQ1KCUHXN';
//Discord
const discordBot = require('./serverData/Discord/server_discord');

//Setups security headers
app.use(helmet({contentSecurityPolicy:{
	useDefaults: true,
    directives: {
	  "script-src": ["'self'"],
      "connect-src": ["'self'", "*.playfabapi.com"],
	  "style-src": ["'self'", "fonts.googleapis.com"]
    },
  }}));

app.use((req, res, next) => {
	res.setHeader(
		"Permissions-Policy",
		'fullscreen=(self), geolocation=(self), camera=(), microphone=(), payment=(), autoplay=(self), document-domain=()'
	);
	next();
});

//Use compression to reduce files size
app.use(compression());

//Send the public files to the domain
app.use(express.static('public', {dotfiles: 'allow'}));

//Websockets communication
server_socket.connect(io, PlayFabServer, PlayFabAdmin, PlayFabClient, discordBot.client);

//Start the server on port 3000
http.listen(process.env.PORT || 3000, () => {
	console.log('listening on *:3000');
});
//Discord
discordBot.startBot();