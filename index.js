var express = require('express');
var http = require('http');
var path = require('path');
var fs   = require('fs');
var parseString = require('xml2js').parseString;

/*
 * configure express app
 */
var app = express();
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'public')));

app.configure(function(){
  app.use(express.bodyParser());
  app.use(app.router);
});

/*
 * Retrieve odds
 */
function getOddsForTeam(content, team, response) {
    var options = {
        host: 'www.sportsbooks.com',
        path: '/lines/cgi/lines.cgi?&sport=201&ct=text/xml'
    };
    var req = http.get(options, function(res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        // Buffer the body entirely for processing as a whole.
        var bodyChunks = [];
        res.on('data', function(chunk) {
            // collecting chunks
            bodyChunks.push(chunk);
        }).on('end', function() { // process the entire body
            var body = Buffer.concat(bodyChunks);
            parseString(body, function (err, result) { // we have a parsed up xml object
                var d = result;
                var feed = d["rss"]["channel"][0]["item"];
                var odds = "";
                for (var i = 0; i < feed.length; i++) {
                    var item = feed[i];
                    var description = item["description"][0];
                    var title = item["title"][0];
                    var re = new RegExp(team.trim(),"gi");
                    var match = title.match(re);
                    if (match) {
                        odds += "<br>" + title + "<br>" + description
                    }
                }
                response.send("Odds for " + search_terms + odds);
            });
        })
    });
}

/*
 * Page rendering stuff
 */
app.get('/', function(req, res){
    res.render('homepage.html');
});

app.get('/search_form/', function(req, res){
    search_terms = req.query.search_terms
    //res.send("You searched: " + search_terms);
    fs.readFile("odds.json", function (err, content) {
        if (err) {
            res.send("Couldn't find a team named: " + search_terms);
        } else {
            //res.send("Odds for " + search_terms + "<br/>" + getOddsForTeam(content, search_terms));
            getOddsForTeam(content, search_terms, res);
        }
    });
});

// Start this sucker
app.listen(app.get('port'));
