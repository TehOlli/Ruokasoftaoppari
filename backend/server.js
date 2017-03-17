var express             = require('express');
var bodyParser          = require('body-parser');
var app                 = express();
var port                = process.env.port || 8080;
var MongoClient         = require('mongodb').MongoClient;
var userModel           = require('./userModel');


//Routing

var router              = express.Router();
var jsonParser          = bodyParser.json();
var urlencodedParser    = bodyParser.urlencoded({extended: false});

//Routing middleware
router.use(function(req, res, next){
    console.log(req.method, req.url);

    next();
});

router.param('name', function(req, res, next, name){

    console.log('Doing validation on ' + name);
    
    //new item saved to req
    req.name = name;

    next();
});

//Routes


app.use('/', router);
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.post('/login', jsonParser, function (req, res) {
    console.log("Login1");
    if(!req.body) return res.sendStatus(400);
    console.log("Login2 " + req.body.username);
    res.send('Welcome, ' + req.body.username);
});


router.get('/user', function(req, res){
        console.log("User check 1");
        userModel.user.find({"username":"Testi2"}).exec(function(err, results){
            console.log("User check 2");
            console.log(results);
        });
});

/*
router.get('/', function(req, res){
    res.send('Frontpage works');
});

router.get('/hello/:name', function(req, res){
    res.send('hello ' + req.params.name + '!');
});

router.get('/login', function(req, res){
        res.send('This is the login');
    });
router.post('/login', function(req, res){
        console.log('processing the login');
        res.send('processing the login');
    });
*/

app.listen(port);
console.log('Connected on port ' + port);