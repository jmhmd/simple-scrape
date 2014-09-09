var fs = require('fs') // node standard library
//var through = require('through')
var split = require('split') // https://github.com/dominictarr/split
var request = require('request') // https://github.com/mikeal/request
var cheerio = require('cheerio') // https://github.com/cheeriojs/cheerio
var async = require('async') // https://github.com/caolan/async
var csv = require('fast-csv') // https://github.com/C2FO/fast-csv

var npis = []

var file = fs.createReadStream('./npi.txt').pipe(split())

file.on('data', function(npi){
    npis.push(npi)
})

file.on('end', function(){
    console.log(npis.length)
    
    getLicenses()
})

// just to keep track via logging while script is working
var i = 1

var getLicense = function(npi, callback){
    
    if (!npi){ callback(null, []) }
    
    var url = 'http://www.hipaaspace.com/Medical_Billing/Coding/National_Provider_Identifier/Codes/NPI_' + npi + '.txt'
    
    request.get(url, function(err, res, body){
        
        // log to keep track of progress
        console.log('Parsing NPI number', i)
        i++
        
        var ch = cheerio.load(body)
        
        var cells = ch('h3#ScopeOfPractice')
                    .filter(function(i, el){
                        return ch(el).text() == 'Scope of Practice'
                    })
                    .next('div.section')
                    .find('table td')
        
        var licenseNumber = ch(cells[3]).text()
        var licenseState = ch(cells[4]).text()
        
        callback(null, [npi, licenseNumber, licenseState])
    })
}

function getLicenses(){
    
    // Slice of only first n for testing purposes
    //npis = npis.slice(0, 1000)
    
    async.mapLimit(npis, 20, getLicense, function(err, results){
        
        if (err){ console.log(err) }
        
        results.unshift(['NPI', 'License Number', 'License State'])
        
        //console.log(results.length, results)
        
        var out = fs.createWriteStream('output.csv')
        
        csv.write(results).pipe(out)
    })
}