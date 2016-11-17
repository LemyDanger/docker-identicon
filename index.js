var express = require('express');
var request = require('request').defaults({ encoding: null });
var crypto = require('crypto');
var bodyParser = require('body-parser');
var redis = require('redis');

var redisClient = redis.createClient(6379, 'redis', {'return_buffers': true});


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

    var name = req.params.name ? req.params.name : defaultName;
    var image;
    console.log("Look for image",name);

    var imageExist = new Promise(function(resolve,reject) {

        // Load image from cache
        redisClient.get(name, function (err, value) {
            console.log("Client",err,value);
            if (!err && value) {
                console.log("Cache hit", value);
                resolve(value);
            } else {
                console.log("Cache miss");
                var uri = 'http://dnmonster:8080/monster/' + name + '?size=80';
                request.get(uri, function (error, response, body) {
                    if (body) {
                        console.log("Image loaded");
                        image = body;
                        console.log("Set", name, image);
                        redisClient.set(name, image);
                        resolve(image);
                    } else {
                        console.log("Image needed")
                        reject();
                    }
                });

            }
        })
    });


    console.log("Promise",imageExist);

    imageExist
        .then(function(image) {
            console.log("Then",arguments);
            res.writeHead(200, {'Content-Type': 'image/png' });
            res.end(image, 'binary');
        })
        .catch(function() {
            console.log("FAIL");
            res.status(404).send();
        });


});

app.listen(3000, function () {
    console.log('dockeridenticon running on 3000!');
});