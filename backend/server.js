var express             = require("express");
var app                 = express();
var config              = require("./config/config.js");
var http                = require("http").Server(app);
//Switch to HTTPS if not using Nginx HTTPS reverse proxy
//var https               = require("https").Server(config.credentials, app);
var io                  = require('./chat/chatController').listen(http)
var fs                  = require('fs');
var path                = require('path');
var bodyParser          = require("body-parser");
var mong                = require("mongoose");
var jwt                 = require("jsonwebtoken");
var group               = require("./group/groupController");
var user                = require("./user/userController");
var Group               = require("./group/groupModel");
var multer              = require('multer');

//==========
//Configuration
//==========

var router              = express.Router();
var authRouter          = express.Router();

app.use(express.static(__dirname + '/public'));
app.use('/', router);

app.use(bodyParser.json());
app.use('/auth', authRouter);

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Email");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    next();
});

authRouter.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Email, userid, groupid");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    next();
});

authRouter.options("/*", function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Email, userid, groupid");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    res.sendStatus(200);
});

mong.Promise = global.Promise;
mong.connect(config.dbConnection, function(err){
    if(err){
        if(err) throw err;
    }else{
        console.log("Mongo connected");
    }
});

//Multer config

var upload = multer({
    dest:'./public/uploads/', 
    fileFilter: function (req, file, cb) {
        var ext = path.extname(file.originalname.toLowerCase());
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return cb(new Error('Only images are allowed.'), false);
        }
        cb(null, true);
    },
    limits:{
        fileSize: 1024*1024
    }
});


//==========
//Router Middleware
//==========

var tokenVerifier = function(req, res, next){
    if(!req.headers["authorization"]) return res.sendStatus(401);
    
    var token = req.headers["authorization"].replace(/^Bearer\s/, '');
  
    if(token){
        jwt.verify(token, config.secret, function(err, decoded){
            if(err){
                console.log("Token authentication failed.");
                return res.status(401).send({ 
                    success: false, 
                    message: "Token authentication failed."
                });
            }else{
                console.log("Token authenticated.")
                req.decoded = decoded;
                next();
            }
        });


    }else{
        return res.status(401).send({
           success: false,
           message: "No token was provided.", 
        });
    }
};

authRouter.use(tokenVerifier);

//Middleware for checking groupID in the request against a user's list of memberships in the db
//User found by the userID in the token
var groupChecker = function(req, res, next){
    if(!req.decoded) return res.sendStatus(401);
    var userID = req.decoded.userID;
    if(req.body.groupid){
        var groupID = req.body.groupid;
    }else if(req.headers["groupid"]){
        var groupID = req.headers["groupid"];
    }
    if(groupID){
        console.log("Checking members in: " + groupID);
        Group.findOne({_id:groupID}, "members.memberID", function(err, results){
            if(err){
                console.log(err);
                return res.status(500).send({
                    success: false,
                    message: "Database error.", 
                });
            }
            if(results){
                var i = 0;
                while(i < results.members.length){
                    var memberID = results.members[i].memberID;
                    var matches = false;
                    if(userID == memberID){
                        console.log("User " + userID + "is a member of " + groupID);
                        matches = true;
                        next();
                        break;
                    }
                    i++;
                };
                if(matches == false){
                    console.log("User is not a member of that group.");
                    return res.status(401).send({
                        success: false,
                        message: "User is not a member of that group.", 
                    });
                }
            }else{
                console.log("No such group.");
                return res.status(404).send({
                    success: false,
                    message: "No such group.", 
                });
            }
        });
    }else{
        console.log("groupChecker caught a request without an ID");
        return res.status(401).send({
            success: false,
            message: "No groupID in the request" 
        });
    }
};

//Middleware for checking userID in the request against the one in the token
//Applied seperately to specific routes so it doesn't interfere with ones that require others' userID
//ex. /invite

var userChecker = function(req, res, next){
    if(!req.decoded) return res.sendStatus(401);

    console.log("Checking requested user against authentication...");
    var userID = req.decoded.userID;

    if(userID == req.body.userID || userID == req.headers["userid"]){
        console.log("Requested user matches authentication.");
        next();
    }else{
        console.log("Requested user does not match authentication.");
            return res.status(401).send({
                success: false,
                message: "Requested user does not match authentication.", 
            });
    }
};

//==========
//Routes
//==========

//User creation & login
app.post('/signup', user.signUp);

app.get('/verify', user.verify);

app.post('/login', user.login);

app.post('/googleauth', user.googleAuth);

//==========
//Authenticated Routes
//==========

 //Used to trigger the authRouter middleware to check for authentication
 authRouter.get('/', function(req, res){
     res.json({success: true, message: "Token authenticated"});
 });

//User routes
authRouter.get('/profile', userChecker, user.getProfile);

authRouter.get('/invites', userChecker, user.getInvites);

authRouter.post('/changeusername', userChecker, user.changeUsername);

authRouter.post('/changepassword', userChecker, user.changePassword);

authRouter.post('/setavatar', userChecker, upload.single('avatar'), user.setAvatar);

authRouter.get('/members', groupChecker, user.getMembers);


//Group routes
authRouter.post('/creategroup', group.createGroup);

authRouter.post('/altergroup', groupChecker, group.alterGroup);

authRouter.get('/groups', userChecker, group.getGroups);

authRouter.get('/getgroup', groupChecker, group.getGroup);

authRouter.post("/invitetogroup", groupChecker, group.invite);

authRouter.post("/acceptinv", userChecker,group.acceptInvitation);

authRouter.post("/declineinv", userChecker, group.declineInvitation);

authRouter.post("/removefromgroup", groupChecker, group.removefromGroup);

authRouter.post("/setgroupimage", groupChecker, upload.single('groupimg'), group.setGroupImage);

authRouter.post("/deletegroup", groupChecker, group.deleteGroup);

authRouter.get("/getmessages", groupChecker, group.getMessages);

authRouter.post("/saveplace", groupChecker, group.savePlace);

authRouter.get("/getplaces", groupChecker, group.getPlaces);

authRouter.post("/deleteplace",  groupChecker, group.deletePlace);




http.listen(config.port, 'localhost', function(err){
    if(err) throw err;
    
    console.log("Connected on port " + config.port);
});


/*
https.listen(config.port, function(err){
    if(err) throw err;

    console.log("HTTPS server listening on port " + config.port + "!");
});

https.createServer(config.credentials, app).listen(config.port, function(err){
    if(err) throw err;

    console.log("HTTPS server listening on port " + config.port);
});
*/
