var express             = require('express');
var bodyParser          = require('body-parser');
var app                 = express();
var port                = process.env.port || 8080;
var mong                = require('mongoose');
var User                = require('./userModel');
var Group               = require('./groupModel');
var config              = require('./config');
var http                = require('http').Server(app);
var io                  = require('socket.io')(http);
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

app.use(express.static(__dirname + '/public'));
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

//Bluebird
mong.Promise = global.Promise;
mong.connect(config.dbConnection);
console.log("Mongo connected");


//==========
//Router Middleware
//==========

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
//Socket.io
//==========

io.on('connection', function(socket){
    console.log("Socket user connected");
    socket.emit()


    socket.on('disconnect', function(){
        console.log('Socket user disconnected');
    });


});

//==========
//Routes
//==========

//User creation
app.post('/signup', jsonParser, function (req, res) {
    if(!req.body) return res.sendStatus(400);

    var userName = req.body.username;
    var userEmail = req.body.email;
    var userPassword = req.body.password;
    console.log("Username is " + userName + " and the email is " + userEmail);
    var newUser = new User({
        username: userName,
        userEmail: userEmail,
        userPassword: userPassword
    });

    User.find({userEmail: userEmail}, function(err, exists){
        if(err) throw err;

        if(exists.length){
            console.log("User with that email already exists");
            console.log("USer exists: " + exists);
            res.json({success: false, message: "User with that email already exists"});
        }else{
            newUser.save(function(err, results){
                if (err) throw err;
                console.log(results);
                console.log("Does not exist " + exists);
                
                var token = jwt.sign(newUser, app.get('secret'), {
                    expiresIn: '24h'
                });
                res.json({
                    success: true,
                    message: 'Token sent',
                    token: token
                });

                User.findOne({username: userName}, function(err, user){
                    if(err) throw err;
                    user.comparePassword(userPassword, function(err, isMatch){
                        if(err) throw err;
                        console.log("userPassword: ", isMatch);
                    });
                    user.comparePassword("flipflop", function(err, isMatch){
                        if(err) throw err;
                        console.log("flipflop: ", isMatch);
                    });
                });
            });
        }
    });
});

app.post('/login', jsonParser, function(req, res){
    if(!req.body) return res.sendStatus(400);

    console.log("Hello, login here.");
    var userEmail = req.body.email;
    var userPassword = req.body.password;
    console.log(userEmail);
    
    User.findOne({userEmail: userEmail}, function(err, user){
        if(err) throw err;
        console.log("Exists: " + user);
        console.log("User exists");
        if(user){
            user.comparePassword(userPassword, function(err, isMatch){
                if(isMatch == true){
                    console.log("login userPassword: ", isMatch);
                    var token = jwt.sign(user, app.get('secret'), {
                        expiresIn: '24h'
                    });
                    res.json({
                        success: true,
                        message: 'Token sent',
                        token: token
                    });
                }else{
                    console.log("Password is incorrect.");
                    res.json({success: false, message: "Email or password is incorrect."});
                }
            });
        }else{
            res.json({success: false, message: "Login failed. User does not exist."});
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
        console.log("Results " + results);
        var groupID = results._id;
        console.log("GroupID: " + groupID);
        console.log("GroupAdmin: " + groupAdmin);
        
        res.json({
            success: true,
            message: 'Group created',
        });
        
        console.log("mitäs helvettiä groupAdmin:" +groupAdmin);
        var newMember = {"memberEmail":groupAdmin};
        Group.findOneAndUpdate({_id: groupID}, {$push:{members: newMember}}, function(err, group){
            if (err) throw err;

            console.log("Admin added to group's members array")
        
            var newGroup = {"groupID": groupID};
            User.findOneAndUpdate({userEmail: groupAdmin}, {$push:{groups: newGroup}}, function(err, user){
                if (err) throw err;

                console.log("Group added to admin's groups array");
            });
        });

    });
});

authRouter.post("/invitetogroup", jsonParser, function(req, res){
    if(!req.body) return res.sendStatus(400);

    var groupID = req.body.id;
    var userEmail = req.body.email;
    console.log("inviteToGroup parameters: groupID " + groupID + " & " + userEmail);

    //Checks if user is already in that group
    User.findOne({userEmail: userEmail}, function(err, exists1){
        if (err) throw err;
            User.find({userEmail: userEmail, "groups.groupID": groupID}, function(err, exists2){
                if (err) throw err;
                console.log("InvitetoGroup exists2:" + exists2);
                if(exists2.length){
                    console.log("User is already in the group");
                    //console.log(exists2);
                res.json({success: false, message: "User is already in the group."});
                }else{
                    var newGroup = {"groupID": groupID};
                    User.findOneAndUpdate({userEmail: userEmail}, {$push:{groups: newGroup}}, function(err, user){
                        if (err) throw err;
                        
                        if(user){
                            console.log("If fired");
                            //console.log(user);

                            var newMember = {"memberEmail":userEmail};
                            Group.findOneAndUpdate({_id:groupID}, {$push:{members: newMember}}, function(err, group){
                                if (err) throw err;
                                console.log("User added to group members");

                                res.json({success:true, message:"User added"});
                            });
                        }else{
                            console.log("User with that email does not exist");
                            res.json({success:false, message:"User with that email does not exist"});
                        }
                    });
                }
            });
    });
});

authRouter.post("/joinGroup", jsonParser, function(req, res){
    if(!req.body) return res.sendStatus(400);

    var groupID = req.body.groupId;
    var userEmail = req.body.email;

});

authRouter.post("/removefromgroup", jsonParser, function(req, res){
    if(!req.body) return res.sendStatus(400);

    var groupID = req.body.groupid;
    var userEmail = req.body.email;

    console.log("Removing " + userEmail + " from " + groupID);

    User.findOneAndUpdate({userEmail:userEmail}, {$pull:{groups:{groupID:groupID}}}, function(err, user){
        if (err) throw err;
        console.log("Removed group from user document");
    
        Group.findOneAndUpdate({_id:groupID}, {$pull:{members:{memberEmail:userEmail}}}, function(err, group){
            if (err) throw err;
            console.log("Removed user from group document");

            res.json({success:true, message:"User removed"});
        });
    });
});

authRouter.post("/deletegroup", jsonParser, function(req, res){
    if(!req.body) return res.sendStatus(400);

    var groupID = req.body.groupid;

    console.log("Deleting group " + groupID);

    Group.remove({_id:groupID}, function(err, results){
        if (err) throw err;

        console.log("Deleted group.")

        User.update({"groups.groupID":groupID}, {$pull:{groups:{groupID:groupID}}} , function(err, members){
            console.log("Removed group from users' member arrays.")

            res.json({success:true, message:"Group deleted"});
        });
    })
});

authRouter.get('/groups', function(req, res){
    if(!req.headers['email']) return res.sendStatus(400);
    userEmail = req.headers['email'];
    //console.log("User email " + userEmail);
    Group.find({'members.memberEmail': userEmail}, function(err, groups){
        //console.log("Groups: " + groups);
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
    //console.log("GroupID: " + groupID);
    User.find({"groups.groupID":groupID}, function(err, members){
        //console.log("Members are: " + members);
        if(members){
            res.json(members);
        }else{
            res.json(null);
        }
    });
});

//app.listen(port);
http.listen(port, function(){
  console.log('listening on *:' + port);
});
console.log('Connected on port ' + port);