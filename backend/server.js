var express             = require("express");
var app                 = express();
var http                = require("http").Server(app);
var https               = require("https");
var io                  = require("socket.io")(http);
var fs                  = require('fs');
var bodyParser          = require("body-parser");
var mong                = require("mongoose");
var Message             = require("./messageModel");
var config              = require("./config");
var jwt                 = require("jsonwebtoken");
var passport            = require("passport");
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
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
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
//Socket.io
//==========

io.use(function(socket, next){
    if(socket.handshake.query && socket.handshake.query.token){
        jwt.verify(socket.handshake.query.token, config.secret, function(err){
            if(err){
                next(new Error("Socket.io auth failed."));
            }else{
                console.log("Socket.io authentication succeeded.");
                next();
            }
        });
    }else{
        console.log("Socket.io auth didn't pass the first if");
    }
});

io.on("connection", function(socket){
    console.log("Socket user connected.");

    socket.on("room", function(room){
        socket.join(room);  
        console.log(room);
    });

    socket.on("removeuser", function(room, user){

    });

    socket.on("message", function(data){
        console.log("message: " + data.msg);
        console.log("room: " + data.room);
        console.log("sender: " + data.username);
        console.log("userid: " + data.author);
        console.log("date: " + data.date);
        console.log("time: " + data.time);

        var F1 = function(F1data, cb){
            console.log("F1Data: " + F1data);
            cb(F1data);
        };

        var F2 = function(F2data){

            console.log("F2Data: " +  F2data);
        }

        F1("BLOOB", F2);

        var newMessage = new Message({
            groupID: data.room,
            msg: data.msg,
            author: data.author,
            username: data.username,
            date: data.date,
            time: data.time
        });
        console.log("newMessage: " + newMessage);

        console.log("Saving message...");
        newMessage.save(function(err, results){
            if(err){
                console.log(err);
                return res.status(503).send({ 
                    success: false, 
                    message: "Unable to save to database."
                });
            }else{
                console.log("Saved message: ");
                console.log(results);
                socket.to(data.room).emit('message', {'msg': data.msg, 'username': data.username, 'date': data.date,'time': data.time});
            }
        })
    });

    socket.on("listupdated", function(data){
        socket.to(data.room).emit("updatelist");
    });

    socket.on("disconnect", function(){
        console.log("Socket user disconnected");
    });
});

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




http.listen(config.port, function(){
  console.log("Connected on port " + config.port);
});

/*
https.createServer(config.credentials, app).listen(port, function(err){
    if(err) throw err;
    console.log("Credentials: " + config.credentials.key + config.credentials.cert);
    console.log("HTTPS server listening on port " + port);
});

http.createServer(app).listen(port, function(err){
    if(err) throw err;
    console.log("HTTP server listening on port " + port);
});

*/