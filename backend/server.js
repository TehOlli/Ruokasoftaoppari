var express             = require('express');
var bodyParser          = require('body-parser');
var app                 = express();
var port                = process.env.port || 8080;
var MongoClient         = require('mongodb').MongoClient;
var User           = require('./userModel');


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

app.post('/signup', jsonParser, function (req, res) {
    console.log("Login1");
    if(!req.body) return res.sendStatus(400);
    console.log("Login2 " + req.body.username);
    res.send('Welcome, ' + req.body.username);

    var userName = req.body.username;
    var userEmail = req.body.email;
    console.log("Username is " + userName);
    var newUser = new User({
        username: userName,
        userEmail: userEmail
    });

    newUser.save(function(err, results){
        if (err) throw err;
        console.log("Saved user: " + req.body.username +".");
        console.log(results);
    });
});


router.get('/user', function(req, res){
        console.log("User check 1");
        User.find({"username":"Testi2"}).exec(function(err, results){
            console.log("User check 2");
            console.log(results);
        });
});

app.listen(port);
console.log('Connected on port ' + port);