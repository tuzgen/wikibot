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
const WIKI_OTD = `${prefix}wikiotd`;
const WIKI_HELP = `${prefix}help`;
const MAX_CHARS = 500;
const WIKI_CLIENT_DOMAIN = "https://en.wikipedia.org/wiki/";
const WIKI_CLIENT_OTD = "https://en.wikipedia.org/wiki/Wikipedia:On_this_day/Today";

// client messages
client.on("message", async (message) => {
  if (!message.author.bot) {
    // avoid schizoid bots
    // select action according to user input
    if (message.content.startsWith(WIKI_SEARCH)) {
      await wikiSearch(message);
    } else if (message.content.startsWith(WIKI_RANDOM)) {
      await wikiRandom(message);
    } else if (message.content.startsWith(WIKI_OTD)) {
      await wikiOTD(message);
    } else if (message.content.startsWith(WIKI_HELP)) {
      wikiHelp(message);
    } else if (message.content.startsWith(prefix)) {
      message.channel.send(`Command not found please use ${WIKI_HELP}`);
    }
  }
});

function wikiHelp(message) {
  // TODO maybe later retrieve help info from another website?
  createHelpEmbed(message.channel);

  function createHelpEmbed(channel) {
    const helpEmbed = new Discord.MessageEmbed()
      .setColor("#0099ff")
      .setTitle("WikiBOT")
      .setURL("https://github.com/oguztuzgen/wikibot")
      .setDescription(
        "WikiBOT is an under-development Wikipedia query tool for Discord servers."
      )
      .addFields(
        {
          name: "Searching Wikipedia",
          value: `\`\`\`${WIKI_SEARCH} [item]\`\`\``,
        },
        {
          name: "Get a random article from Wikipedia",
          value: `\`\`\`${WIKI_RANDOM}\`\`\``,
        },
        {
          name: "Get today's events, births, deaths and holdiays",
          value: `\`\`\`${WIKI_OTD}\`\`\``, // TODO make events births etc options
        }
      )
      .setTimestamp();
    channel.send(helpEmbed);
  }
}

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
          value:
            `[${pages[Object.keys(pages)[1]].title}](${encodeURI(
              WIKI_CLIENT_DOMAIN + pages[Object.keys(pages)[1]].title
            )})\n` + pages[Object.keys(pages)[1]].extract,
          inline: true,
        },
        {
          name: pages[Object.keys(pages)[2]].title,
          value:
            `[${pages[Object.keys(pages)[2]].title}](${encodeURI(
              WIKI_CLIENT_DOMAIN + pages[Object.keys(pages)[2]].title
            )})\n` + pages[Object.keys(pages)[2]].extract,
          inline: true,
        }
      )
      .setImage(
        pages[Object.keys(pages)[0]].hasOwnProperty("thumbnail")
          ? pages[Object.keys(pages)[0]].thumbnail.source
          : "https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/1200px-Wikipedia-logo-v2.svg.png"
      )
      .setTimestamp();

    channel.send(searchEmbed);
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
}

async function wikiOTD(message) {
	var today = new Date(); 

  const otdURL = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/all/${('0' + (today.getMonth() + 1)).slice(-2)}/${('0' + today.getDate()).slice(-2)}`;
  var result = await requestData(encodeURI(otdURL));

  console.log(otdURL);

  // this API does not have a 'query' field so the check is done via selected
  if (result.hasOwnProperty("selected")) {
	  var pagesList = [
		result.selected[Object.keys(result.selected)[0]].pages, 
	  	result.births[Object.keys(result.births)[0]].pages, 
	  	result.deaths[Object.keys(result.deaths)[0]].pages, 
	  	result.events[Object.keys(result.events)[0]].pages, 
	  	result.holidays[Object.keys(result.holidays)[0]].pages];

	  console.log(getFirstPageTitle(pagesList[0]));
	  console.log(getFirstPageWebsiteURL(pagesList[0]));
	  console.log(getFirstPageExtract(pagesList[0]));

	  var items = [];
	  
		pagesList.forEach(pages => {
			items.push({
				name: getFirstPageTitle(pages),
				value: `[${getFirstPageTitle(pages)}](${getFirstPageWebsiteURL(pages)})\n` + getFirstPageExtract(pages),
				inline: false
			});
		});

		console.log(items);

	  function getFirstPageWebsiteURL(pages) {
		return pages[Object.keys(pages)[0]].content_urls.desktop.page;
	  }

	  function getFirstPageTitle(pages) {
		return pages[Object.keys(pages)[0]].displaytitle;
	  }

	  function getFirstPageExtract(pages) {
		  return pages[Object.keys(pages)[0]].extract;
	  }

	createOTDEmbed(
		"On this day in Wikipedia",
		pagesList,
		message.channel
	);
  } else {
    console.log("ERROR: result has no property 'query'");
  }
  

  function createOTDEmbed(title, pagesList, channel) {
    const OTDEmbed = new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle(title)
    .setURL(WIKI_CLIENT_OTD)
    .setDescription(new Date().toDateString())
	.addFields(items)
    .setTimestamp();
  channel.send(OTDEmbed);
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
