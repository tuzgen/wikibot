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
    } else {
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
    if (wikiSearchResults.hasOwnProperty("query")) {
      let pages = wikiSearchResults.query.pages;

      createSearchEmbed(
        pages[Object.keys(pages)[0]].title,
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
  const randomURL =
    "https://en.wikipedia.org/w/api.php?format=json&action=query&generator=random&grnnamespace=0&prop=pageimages|extracts&exchars=500&exintro&explaintext&exlimit=max&format=json&origin=*";
  var result = await requestData(encodeURI(randomURL));

  console.log(result);

  if (result.hasOwnProperty("query")) {
    console.log(result);

    let pages = result.query.pages;
    let firstPage = pages[Object.keys(pages)[0]];
    console.log(
      "Website url: " + encodeURI(WIKI_CLIENT_DOMAIN + firstPage.title)
    );
    console.log(firstPage.title);
    createRandomEmbed(
      firstPage.title,
      pages,
      encodeURI(WIKI_CLIENT_DOMAIN + firstPage.title),
      message.channel
    );
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

  
  const searchEmbed = new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle(title)
    .setURL(link)
    .setDescription(pages[Object.keys(pages)[0]].extract)
    .addFields(
      {
		name: `I found ${pages[Object.keys(pages)[0]].title}`,
        value: "But did you mean:",
        inline: false,
      },
      {
        name: pages[Object.keys(pages)[1]].title,
        value: `[${pages[Object.keys(pages)[1]].title}](${encodeURI(
			WIKI_CLIENT_DOMAIN + pages[Object.keys(pages)[1]].title
		  )})\n` + pages[Object.keys(pages)[1]].extract,
        inline: true,
      },
      {
        name: pages[Object.keys(pages)[2]].title,
        value: `[${pages[Object.keys(pages)[2]].title}](${encodeURI(
			WIKI_CLIENT_DOMAIN + pages[Object.keys(pages)[2]].title
		  )})\n` + pages[Object.keys(pages)[2]].extract,
        inline: true,
      },
    )
    .setImage(
      pages[Object.keys(pages)[0]].hasOwnProperty("thumbnail")
        ? pages[Object.keys(pages)[0]].thumbnail.source
        : "https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/1200px-Wikipedia-logo-v2.svg.png"
    )
    .setTimestamp();

  channel.send(searchEmbed);
}

function createRandomEmbed(title, pages, link, channel) {
  const randomEmbed = new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle(title)
    .setURL(link)
    .setDescription(pages[Object.keys(pages)[0]].extract)
    .setImage(
      pages[Object.keys(pages)[0]].hasOwnProperty("thumbnail")
        ? pages[Object.keys(pages)[0]].thumbnail.source
        : "https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/1200px-Wikipedia-logo-v2.svg.png"
    )
    .setTimestamp();
  channel.send(randomEmbed);
}