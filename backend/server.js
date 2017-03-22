var express             = require('express');
var bodyParser          = require('body-parser');
var app                 = express();
var port                = process.env.port || 8080;
var MongoClient         = require('mongodb').MongoClient;
var User                = require('./userModel');
var config              = require('./config');
var jwt                 = require('jsonwebtoken');
var passport            = require('passport');
var Strategy            = require('passport-http-bearer').Strategy;

//==========
//Configuration
//==========
var router              = express.Router();
var authRouter          = express.Router();
var jsonParser          = bodyParser.json();
var urlencodedParser    = bodyParser.urlencoded({extended: false});

app.set('secret', config.secret);
app.use('/', router);
app.use('/auth', authRouter);
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    next();
});
authRouter.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    next();
});

authRouter.options("/*", function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.sendStatus(200);
});

passport.use(new Strategy(
  function(token, done) {
    User.findOne({ token: token }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      return done(null, user, { scope: 'all' });
    });
  }
));

//==========
//Router Middleware
//==========

/*
app.get('/users', 
  passport.authenticate('bearer', { session: false }),
  function(req, res) {
    res.json(req.user);
    console.log("wot");
  });
*/

authRouter.use(function(req, res, next){
    try{
        console.log("---");
        console.log(JSON.stringify(req.headers));
        console.log("---");
        console.log(JSON.stringify(req.headers['authorization']));
        var token = req.headers['authorization'].replace(/^Bearer\s/, '');
    }catch(e){
        console.log(e.message);
    }
    if(token){
        jwt.verify(token, app.get('secret'), function(err, decoded){
            if(err){
                return res.json({success: false, message: 'Token authentication failed.'})
            }else{
                req.decoded = decoded;
                console.log("Decoded: " + decoded)
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

//==========
//Routes
//==========

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
/*
app.post('/authssssssss', function(req, res){
    User.findOne({
        username: req.body.username
    }, function(){
        if(err) throw err;

        if(!user){
            res.json({})
        }
    })
});
*/

//==========
//Authenticated Routes
//==========

//Checking arriving user for token
authRouter.get('/', function(req, res){
    res.json({success: true, message: "Token authenticated"});
});

//Get all users (returns JSON)
authRouter.get('/users', function(req,res){
    User.find({}, function(err, users){
        res.json(users);
    });
});

//Group creation
authRouter.get('/createGroup', function(req, res){
    if(!req.body) return res.sendStatus(400);

    var groupName = req.body.username();
});

app.listen(port);
console.log('Connected on port ' + port);