var express             = require("express");
var bodyParser          = require("body-parser");
var app                 = express();
var port                = process.env.port || 8080;
var mong                = require("mongoose");
var Message             = require("./messageModel");
var config              = require("./config");
var http                = require("http").Server(app);
var io                  = require("socket.io")(http);
var jwt                 = require("jsonwebtoken");
var passport            = require("passport");
var multer              = require('multer');
var upload              = multer({dest:'./public/uploads/'});
var group               = require("./group/groupController");
var user                = require("./user/userController");
var Group               = require("./group/groupModel");


//==========
//Configuration
//==========

var router              = express.Router();
var authRouter          = express.Router();

app.use(express.static(__dirname + '/public'));
app.set('secret', config.secret);
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

//Bluebird
mong.Promise = global.Promise;
mong.connect(config.dbConnection, function(err){
    if(err){
        if(err) throw err;
    }else{
        console.log("Mongo connected");
    }
});


//==========
//Router Middleware
//==========

authRouter.use(function(req, res, next){
    try{
        var token = req.headers["authorization"].replace(/^Bearer\s/, '');
    }catch(e){
        console.log(e.message);
    }
    if(token){
        jwt.verify(token, config.secret, function(err, decoded){
            if(err){
                console.log("Token authentication failed.");
                return res.status(403).send({ 
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
        return res.status(403).send({
           success: false,
           message: "No token was provided.", 
        });
    }
});

//Middleware for checking groupID in the request against a user's list of memberships in the db
//User found by the userID in the token

var groupChecker = function(req, res, next){
    if(!req.decoded) return res.sendStatus(403);

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
                for(i=0; i<results.members.length; i++){
                    var memberID = results.members[i].memberID;

                    if(userID == memberID){
                        console.log("User " + userID + "is a member of " + groupID);
                        req.body.group = group;
                        next();
                    }else{
                        console.log("User is not a member of that group.");
                        return res.status(401).send({
                            success: false,
                            message: "User is not a member of that group.", 
                        });
                    }
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
        console.log("No IDs provided so moving on...");
        next();
    }
};

//Middleware for checking userID in the request against the one in the token
//Applied seperately to specific routes so it doesn't interfere with ones that require others' userID
//ex. /invitetogroup
var userChecker = function(req, res, next){
    if(!req.decoded) return res.sendStatus(403);

    console.log("Checking requested user against authentication...");
    var userID = req.decoded.userID;

    if(userID == req.body.userID || userID == req.headers["userid"]){
        console.log("Requested user matches authentication.");
        next();
    }else{
        console.log("Requested user does not match authentication.");
            return res.status(403).send({
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
}) 

io.on("connection", function(socket){
    console.log("Socket user connected.");

    socket.on("room", function(room){
        socket.join(room);  
        console.log(room);
    });

    socket.on("message", function(data){
        console.log("message: " + data.msg);
        console.log("room: " + data.room);
        console.log("sender: " + data.username);
        console.log("userid: " + data.userid);
        console.log("date: " + data.date);
        console.log("time: " + data.time);

        var newMessage = new Message({
            groupID: data.room,
            msg: data.msg,
            author: data.userid,
            username: data.username,
            date: data.date,
            time: data.time
        });
        console.log("newMessage: " + newMessage);

        console.log("Saving message...");
        newMessage.save(function(err, results){
            if(err){
                return res.status(503).send({ 
                    success: false, 
                    message: "Unable to save to database."
                });
                console.log(err);
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
app.post("/signup", user.signUp);

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

authRouter.post("/invitetogroup", groupChecker, group.invitetoGroup);

authRouter.post("/acceptinv", userChecker,group.acceptInvitation);

authRouter.post("/declineinv", userChecker, group.declineInvitation);

authRouter.post("/removefromgroup", groupChecker, group.removefromGroup);

authRouter.post("/setgroupimage", groupChecker, upload.single('groupimg'), group.setGroupImage);

authRouter.post("/deletegroup", groupChecker, group.deleteGroup);

authRouter.get("/getmessages", groupChecker, group.getMessages);

authRouter.post("/saveplace", groupChecker, group.savePlace);

authRouter.get("/getplaces", groupChecker, group.getPlaces);

authRouter.post("/deleteplace",  groupChecker, group.deletePlace);




//app.listen(port);
http.listen(port, function(){
  console.log("Connected on port " + port);
});