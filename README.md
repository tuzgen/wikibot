# WikiBOT

WikiBOT is a Wikipedia query tool which you can use in your discord server.

## Features
### Wiki search
Command: ``` ~~wikisearch [item] ```

Searches wikipedia for the specified query. If there are multiple articles with the same name, show an embed listing these and wait for the same user to enter the number of their preference.

### Random article
Command: ``` ~~wikisearch random ```

Gets a random article and displays it on the chat window. This is achieved by using Wikipedia's random article feature.

### Article of the day
Command: ``` ~~wikisearch aotd ```

Retrieves and displays the article of the day.

### On this day
Command: ``` ~~wikisearch otd ```

Displays a list of events that occured on this day in history in an embed.

### Get references
Command: ``` ~~wikisearch [item or wikipedia url] ```

Displays the list of references for a specified page. Since urls in Wikipedia are language specific, switch to the set language of the BOT.

### Languages
Command: ``` ~~wikisearch language [language] ```

Change the language setting for the BOT queries. Default is American English. Note: This feature might not be supported by Wikipedia API unless we use a translating software.

## Dependencies
Node.js version 12.18.3
Discord.js version 12.3.1

## Can I add WikiBOT to my Server?
Unfortunately, currently WikiBOT is not hosted therefore is not available for public use.

## Current Maintainers
[Oğuz Tüzgen](https://github.com/oguztuzgen)
[Selçuk Yılmaz](https://github.com/SelcuukYilmazz)

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)