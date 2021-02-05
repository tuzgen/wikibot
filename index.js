// set up dependencies
const Discord = require('discord.js');

// set up discord client
const { prefix, token } = require('./config.json');
const client = new Discord.Client();

// ready prompt
client.once('ready', () => {
	console.log('Ready.. with prefix ' + prefix);
})

// login using bot token
client.login(token);

// state variables
client.on('message', (message) => {
	if (message.content.startsWith(`${prefix}wikisearch`)) {
		var toSearch = message.content.substr(11);
		message.channel.send(`Searching ${toSearch} on Wikipedia...`);
	}
})

// functions
function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}
