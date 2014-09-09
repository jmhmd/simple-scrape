# Simple Scrape

## Install

* install node.js
* clone this repository
* ```npm install```
* ```node scrape.js```

## Output

Output will appear in output.csv

## Dependencies

* (Request)[https://github.com/mikeal/request] for making asynchronous requests from node.js and pulling in html
* (Async)[https://github.com/caolan/async] for keeping track of lots of asynchronous requests
* (Cheerio)[https://github.com/cheeriojs/cheerio] for traversing returned html like jQuery, only on the server side
* (Split)[https://github.com/dominictarr/split] for splitting text file read stream by newline to read into an array
* (Fast-CSV)[https://github.com/C2FO/fast-csv] for turning an array of values into a csv file


