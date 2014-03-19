var express = require('express');
var http = require('http');
var path = require('path');
var fs   = require('fs');

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

function getOddsForTeam(content, team) {
    odds = JSON.parse(content);
    data = odds[team.toLowerCase().trim()];
    var p = "<table><tr><td>"+data["teams"][0]+"</td><td>"+data["LVH"][0]+"</td></tr><tr><td>"+data["teams"][1]+"</td><td>"+data["LVH"][1]+"</td></tr></table>";
    return p;
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
            res.send("Odds for " + search_terms + "<br/>" + getOddsForTeam(content, search_terms));
        }
    });
});

// Start this sucker
app.listen(app.get('port'));
