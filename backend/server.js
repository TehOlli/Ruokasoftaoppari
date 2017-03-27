var express             = require('express');
var bodyParser          = require('body-parser');
var app                 = express();
var port                = process.env.port || 8080;
var mong                = require('mongoose');
var User                = require('./userModel');
var Group               = require('./groupModel');
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
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Email");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    next();
});
authRouter.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Email, id");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    next();
});

authRouter.options("/*", function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Email, id");
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

mong.connect(config.dbConnection);
console.log("Mongo connected");


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
        var token = req.headers['authorization'].replace(/^Bearer\s/, '');
    }catch(e){
        console.log(e.message);
    }
    if(token){
        jwt.verify(token, app.get('secret'), function(err, decoded){
            if(err){
                return res.status(403).send({ 
                    success: false, 
                    message: 'Token authentication failed.'
                });
                console.log("kaikki hajos");
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

    User.find({userEmail: userEmail}, function(err, exists){
        if(exists.length){
            console.log("User with that email already exists");
            console.log(exists);
            res.json({success: false, message: "User with that email already exists"});
        }else{
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
        }
    });
});
//==========
//Authenticated Routes
//==========

//Used to trigger the authRouter middleware to check for authentication
authRouter.get('/', function(req, res){
    res.json({success: true, message: "Token authenticated"});
    console.log("Token authenticated");
});

//Get all users (returns JSON)
authRouter.get('/users', function(req,res){
    User.find({}, function(err, users){
        res.json(users);
    });
});

//Group creation
authRouter.post('/creategroup', jsonParser, function(req, res){
    if(!req.body) return res.sendStatus(400);

    var groupName = req.body.groupname;
    var groupAdmin = req.body.email;
    var groupDesc = req.body.description;

    var newGroup = new Group({
        groupName: groupName,
        groupAdmin: groupAdmin,
        groupDesc: groupDesc
    });

    newGroup.save(function(err, results){
        if (err) throw err;
        console.log(results);
        
        res.json({
            success: true,
            message: 'Group created',
        });
    });
});

authRouter.post("/invitetogroup", jsonParser, function(req, res){
    if(!req.body) return res.sendStatus(400);

    var groupID = req.body.id;
    var userEmail = req.body.email;
    console.log("inviteToGroup parameters: groupID " + groupID + " & " + userEmail);

    //Checks if user is already in that group
    User.find({userEmail: userEmail, groups: groupID}, function(err, exists){
        if(exists.length){
            console.log("User is already in the group");
            console.log(exists);
        }else{
            User.findOneAndUpdate({userEmail: userEmail}, {$push:{groups: groupID}}, function(err, user){
                if(err) return handleError(err);
                
                if(user != null){
                    console.log("If fired");
                    res.send(user);
                    console.log(user);
                }else{
                    console.log("Else fired");
                    res.json({success:true, message:"User does not exist"});
                }

            });
        }
    });
});

authRouter.post("/joinGroup", jsonParser, function(req, res){
    if(!req.body) return res.sendStatus(400);

    var groupID = req.body.groupId;
    var userEmail = req.body.email;

});

authRouter.get('/groups', function(req, res){
    if(!req.headers['email']) return res.sendStatus(400);
    userEmail = req.headers['email'];
    console.log("User email " + userEmail);
    Group.find({groupAdmin:userEmail}, function(err, groups){
        console.log("Groups: " +  groups);
        if(groups == ""){
            res.json(null);
        }else{
            res.json(groups);
        };
    });
});

authRouter.get('/members', function(req, res){
    if(!req.headers['id']) return res.sendStatus(400);
    groupID = req.headers['id'];
    console.log("GroupID: " + groupID);
    User.find({groups: groupID}, function(err, members){
        console.log("Members are: " + members);
        if(members.length){
            res.json(members);
        }else{
            res.json(null);
        }
    });
});

app.listen(port);
console.log('Connected on port ' + port);