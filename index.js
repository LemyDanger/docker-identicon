var express = require('express');
var request = require('request').defaults({ encoding: null });
var crypto = require('crypto');
var bodyParser = require('body-parser');
var fs = require('fs');

var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.set('view engine', 'pug');

var defaultName = "Joachim Hahn";

app.all('/', function(req,res) {
    var name = defaultName;

    switch(req.method) {
        case 'POST':
            name = req.body.name;
        case 'GET':
            hash = crypto.createHash('md5').update(name).digest('hex');
            res.render('index', { name : name, hash: hash});
            break;
        default:
            res.status(500).send('So nicht Freundchen!');

    }
});

app.get('/monster/:name', function(req,res) {

    name = req.params.name ? req.params.name : defaultName;
    var uri = 'http://dnmonster:8080/monster/'+name+'?size=80';

    request.get(uri, function(error,response,body) {
        image = body;
        res.writeHead(200, {'Content-Type': 'image/png' });
        res.end(image, 'binary');
    });
});

app.listen(3000, function () {
    console.log('dockeridenticon running on 3000!');
});