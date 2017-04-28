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
//var Strategy          = require("passport-http-bearer").Strategy;


//==========
//Configuration
//==========

var router              = express.Router();
var authRouter          = express.Router();
var jsonParser          = bodyParser.json();
var urlencodedParser    = bodyParser.urlencoded({extended: false});

app.use(express.static(__dirname + '/public'));
app.set('secret', config.secret);
app.use('/', router);
app.use('/auth', authRouter);
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Email");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    next();
});

authRouter.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Email, id");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    next();
});

authRouter.options("/*", function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Email, id");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    res.sendStatus(200);
});
/*
passport.use(new Strategy(
  function(token, done) {
    User.findOne({ token: token }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      return done(null, user, { scope: 'all' });
    });
  }
));
*/
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
        jwt.verify(token, app.get("secret"), function(err, decoded){
            if(err){
                return res.status(403).send({ 
                    success: false, 
                    message: "Token authentication failed."
                });
                console.log("authRouter Middleware: jwt.verify portion failed.");
                console.log(err);
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

//==========
//Socket.io
//==========

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
        console.log("email: " + data.email);
        console.log("date: " + data.date);
        console.log("time: " + data.time);

        var newMessage = new Message({
            groupID: data.room,
            msg: data.msg,
            author: data.email,
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
        //callback(true);
    });

    socket.on("disconnect", function(){
        console.log("Socket user disconnected");
    });
});

//==========
//Routes
//==========

//User creation & login
app.post("/signup", jsonParser, user.signUp);

app.post('/login', jsonParser, user.login);
//==========
//Authenticated Routes
//==========

//Used to trigger the authRouter middleware to check for authentication
authRouter.get('/', function(req, res){
    res.json({success: true, message: "Token authenticated"});
    console.log("Token authenticated");
});


//User routes
authRouter.post('/changeusername', jsonParser, user.changeUsername);

authRouter.post('/changepassword', jsonParser, user.changePassword);

authRouter.post('/setavatar', jsonParser, upload.single('avatar'), user.setAvatar);

authRouter.get('/members', user.getUsers);

authRouter.get('/profile', user.getProfile);

authRouter.get('/invites', user.getInvites);


//Group routes
authRouter.post('/creategroup', jsonParser, group.createGroup);

authRouter.post('/altergroup', jsonParser, group.alterGroup);

authRouter.get('/groups', group.getGroups);

authRouter.get('/getgroup', jsonParser, group.getGroup);

authRouter.post("/invitetogroup", jsonParser, group.invitetoGroup);

authRouter.post("/acceptinv", jsonParser, group.acceptInvitation);

authRouter.post("/declineinv", jsonParser, group.declineInvitation);

authRouter.post("/removefromgroup", jsonParser, group.removefromGroup);

authRouter.post("/setgroupimage", jsonParser, upload.single('groupimg'), group.setGroupImage);

authRouter.post("/deletegroup", jsonParser, group.deleteGroup);

authRouter.get("/getmessages", group.getMessages);




//app.listen(port);
http.listen(port, function(){
  console.log("Connected on port " + port);
});