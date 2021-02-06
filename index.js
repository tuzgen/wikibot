// set up dependencies
const Discord = require("discord.js");
const fetch = require("node-fetch");

// set up discord client
const { prefix, token } = require("./config.json");
const client = new Discord.Client();

// ready prompt
client.once("ready", () => {
  console.log("Ready.. with prefix " + prefix);
});

// login using bot token
client.login(token);

// CONSTANTS
const WIKI_SEARCH = `${prefix}wikisearch`;
const WIKI_RANDOM = `${prefix}wikirandom`;
const MAX_CHARS = 500;
const WIKI_CLIENT_DOMAIN = "https://en.wikipedia.org/wiki/";

// client messages
client.on("message", async (message) => {
  if (!message.author.bot) {
    if (message.content.startsWith(WIKI_SEARCH)) {
      await wikiSearch(message);
    } else if (message.content.startsWith(WIKI_RANDOM)) {
		await wikiRandom(message);
	}
	
	else {
      message.channel.send(`Command not found please use ${prefix}help`);
    }
  }
});

// functions
async function wikiSearch(message) {
  // parse message
  var toSearch = message.content.substr(WIKI_SEARCH.length + 1);

  if (toSearch.length > 0) {
    // output prompt
    message.channel.send(
      `\`\`\`Searching \"${toSearch}\" on Wikipedia...\`\`\``
    );

    var wikiSearchResults = await requestData(getWikiSearchString(toSearch));
    // let resultArray = [];
    if (wikiSearchResults.hasOwnProperty("query")) {
      // resultArray = processWikiResults(wikiSearchResults.query.pages[0]);

      let pages = wikiSearchResults.query.pages;

      createSearchEmbed(
        toSearch,
        pages,
        encodeURI(WIKI_CLIENT_DOMAIN + toSearch),
        message.channel
      );
    } else {
      message.channel.send("Could not found that...");
    }
  } else {
    message.channel.send(`I can't search for nothing you dumbfuck`);
  }
}

async function wikiRandom(message) {
	const randomURL = "https://en.wikipedia.org/w/api.php?action=query&list=random&format=json&rnnamespace=0&rnlimit=1";
	var result = await requestData(encodeURI(randomURL));

	if (result.hasOwnProperty("query")) {
		console.log("Data: " + result);

		let pages = result.query.pages;
		let firstPage = pages[Object.keys(pages)[0]];
		console.error("\n\n" + encodeURI(WIKI_CLIENT_DOMAIN + firstPage.title) + "\n\n");
		createSearchEmbed(firstPage.title, pages, encodeURI(WIKI_CLIENT_DOMAIN + firstPage.title), message);
	} else {
		console.log("ERROR: result has no property 'query'");
	}
}

function getWikiSearchString(searchTerm) {
	// append the search term and maximum char lenght to the api url
  var rawSearchString = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${searchTerm}&gsrlimit=20&prop=pageimages|extracts&exchars=${MAX_CHARS}&exintro&explaintext&exlimit=max&format=json&origin=*`;
  const searchString = encodeURI(rawSearchString);
  return searchString;
}

async function requestData(searchString) {
  try {
    // get the json from the api
    const response = await fetch(searchString);
    // convert to json
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(err);
  }
}

function createSearchEmbed(title, pages, link, channel) {
  console.log(pages[Object.keys(pages)[0]]);
  const exampleEmbed = new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle(title)
    .setURL(link)
    .setAuthor(
      // thunmbnail image breaks other parts
      "Wikipedia",
      pages[Object.keys(pages)[0]].hasOwnProperty("thumbnail")
        ? pages[Object.keys(pages)[0]].thumbnail.source
        : "https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/1200px-Wikipedia-logo-v2.svg.png",
      link
    )
    .setDescription(pages[Object.keys(pages)[0]].extract)
    .setThumbnail(pages[Object.keys(pages)[0]].extract)
    .addFields(
      {
        name: "Did you mean",
        value: pages[Object.keys(pages)[1]].extract,
        inline: true,
      },
      {
        name: "Did you mean",
        value: pages[Object.keys(pages)[2]].extract,
        inline: true,
      },
      {
        name: "Did you mean",
        value: pages[Object.keys(pages)[3]].extract,
        inline: true,
      }
    )

    .setTimestamp()
    .setFooter("Some footer text here", "https://i.imgur.com/wSTFkRM.png");

  channel.send(exampleEmbed);
}

// code dumpster
function processWikiResults(results) {
  const resultArray = [];
  Object.keys(results).forEach((key) => {
    const id = key;
    const title = results[key].title;
    const text = results[key].extract;
    const img = results[key].hasOwnProperty("thumbnail")
      ? results[key].thumbnail.source
      : null;
    const item = {
      id: id,
      title: title,
      img: img,
      text: text,
    };
    resultArray.push(item);
  });
  return resultArray;
}

// functions
function httpGet(theUrl) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", theUrl, false); // false for synchronous request
  xmlHttp.send(null);
  return xmlHttp.responseText;
}
