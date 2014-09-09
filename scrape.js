var fs = require('fs')
//var through = require('through')
var split = require('split')
var request = require('request')
var cheerio = require('cheerio')
var async = require('async')
var csv = require('fast-csv')

var npis = []

var file = fs.createReadStream('./npi.txt').pipe(split())

file.on('data', function(npi){
    npis.push(npi)
})

file.on('end', function(){
    console.log(npis.length)
    
    getLicenses()
})

var i = 1
var getLicense = function(npi, callback){
    
    if (!npi){ callback(null, []) }
    
    var url = 'http://www.hipaaspace.com/Medical_Billing/Coding/National_Provider_Identifier/Codes/NPI_' + npi + '.txt'
    
    request.get(url, function(err, res, body){
        
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