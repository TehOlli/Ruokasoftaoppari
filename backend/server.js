var express = require('express');
var app     = express();
var port    = process.env.port || 8080;
var MongoClient = require('mongodb').MongoClient;

//Routing

var router = express.Router();

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

app.route('/login')
    .get(function(req, res){
        res.send('Login goes here');

    })
    .post(function(req, res){
        console.log('Login processing');
        res.send('Processing the login');
    });

router.get('/user', function(req, res){
    var url = 'mongodb://username:password@proto453.haaga-helia.fi:80?authMechanism=DEFAULT&authSource=db';
    MongoClient.connect(url, function(err, db){
        if(!err){
            console.log("We are connected!");
         }else{
             console.log("Connection failed, dammit.")
         }
    })
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
app.use('/', router);

app.listen(port);
console.log('Connected on port ' + port);