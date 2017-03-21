var express             = require('express');
var bodyParser          = require('body-parser');
var app                 = express();
var port                = process.env.port || 8080;
var MongoClient         = require('mongodb').MongoClient;
var User                = require('./userModel');
var config              = require('./config');
var jwt                 = require('jsonwebtoken');

//==========
//Configuration
//==========
var router              = express.Router();
var authRouter          = express.Router();
var jsonParser          = bodyParser.json();
var urlencodedParser    = bodyParser.urlencoded({extended: false});

app.set('secret', config.secret);

//==========
//Router Middleware
//==========


authRouter.use(function(req, res, next){
    try{
        var token = req.headers['token'];
    }catch(e){
        console.log(e.message);
    }
    if(token){
        jwt.verify(token, app.get('secret'), function(err, decoded){
            if(err){
                return res.json({success: false, message: 'Token authentication failed.'})
            }else{
                req.decoded = decoded;
                next();
            }

        });
    }else{
        return res.status(403).send({
           success: false,
           message: 'No token was provided.', 
        });
    }
});

/*
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
*/
//==========
//Routes
//==========

app.use('/', router);
app.use('/auth', authRouter);
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
authRouter.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//User creation
app.post('/signup', jsonParser, function (req, res) {
    if(!req.body) return res.sendStatus(400);

    var userName = req.body.username;
    var userEmail = req.body.email;
    console.log("Username is " + userName + "and the email is " + userEmail);
    var newUser = new User({
        username: userName,
        userEmail: userEmail
    });

    newUser.save(function(err, results){
        if (err) throw err;
        console.log(results);
        
        var token = jwt.sign(newUser, app.get('secret'), {
            expiresIn: '24h'
        });

        res.json({
            success: true,
            message: 'Token sent',
            token: token
        });
       
    });
});

//Authentication (unfinished)
app.post('/auth', function(req, res){
    User.findOne({
        username: req.body.username
    }, function(){
        if(err) throw err;

        if(!user){
            res.json({})
        }
    })
});

//==========
//Authenticated Routes
//==========

//Get all users (returns JSON)
authRouter.get('/users', function(req,res){
    User.find({}, function(err, users){
        res.json(users);
    });
});

app.listen(port);
console.log('Connected on port ' + port);