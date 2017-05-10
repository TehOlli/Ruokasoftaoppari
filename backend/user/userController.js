var User                = require("./userModel");
var fs                  = require("fs");
var jwt                 = require("jsonwebtoken");
var express             = require("express");
var app                 = express();
var config              = require("../config");
var GoogleAuth          = require('google-auth-library');
var emailService        = require('../emailService.js');

app.set('secret', config.secret);

exports.signUp = function(req, res){
    if(!req.body) return res.sendStatus(400);

    console.log("Hostname: " + req.hostname);

    var userName = req.body.username;
    var userEmail = req.body.email;
    var userPassword = req.body.password;
    console.log("Username is " + userName + " and the email is " + userEmail);
    var newUser = new User({
        username: userName,
        userEmail: userEmail,
        userPassword: userPassword,
        verified: false,
        GAuth: false
    });

    User.find({userEmail: userEmail}, function(err, exists){
        if(err){
            console.log("Couldn't access database.");
            console.log(err);
            return res.status(500).send({
                    success: false,
                    message: "Database error.", 
            });      
        }else{
            if(exists.length){
                console.log("User with that email already exists");
                console.log("User exists: " + exists);
                res.json({success: false, message: "User with that email already exists"});
            }else{
                newUser.save(function(err, user){
                    if (err){
                        console.log("Couldn't save to database.");
                        console.log(err);
                        return res.status(500).send({
                                success: false,
                                message: "Database error.", 
                        });      
                    }else{
                        console.log(user);

                        emailService.sendConfirmation(user, req, function(err, cb){
                            if(err){
                                console.log("Error in sending verification link.");
                                console.log(err);
                            }else{
                                res.json({success: true, message: "A verification link has been sent to your email."});
                            }
                        });
                        
                    }
                });
            }
        }
    });
};

exports.verify = function(req, res){

    console.log("Verify here.");

    var linkEmail = req.query.email;
    var userID = req.query.id;

    console.log("Enabling user account...");
    User.findOneAndUpdate({userEmail:linkEmail, _id:userID, verified:false}, {verified:true}, function(err, user){
        if(err){
            console.log("Verify threw an error:")
            console.log(err);
            return res.status(500).send({
                success: false,
                message: "Database error.", 
            });
        }else{
            if(exists){}
            console.log("User verified.");
            res.json({success:true, message: "Account verified."});

        }
    });
};

exports.login = function(req, res){
    if(!req.body) return res.sendStatus(400);

    console.log("Hello, login here.");
    var userEmail = req.body.email;
    var userPassword = req.body.password;
    console.log(userEmail);
    
    User.findOne({userEmail: userEmail, verified:true}, function(err, user){
        if(err){
            res.json({success: false, message: "Couldn't access database."})
            console.log("Couldn't access database.");
            console.log(err);
        }else{
            console.log("Exists: " + user);
            if(user){
                user.comparePassword(userPassword, function(err, isMatch){
                    if(isMatch == true){
                        console.log("login userPassword: ", isMatch);
                        console.log("userEmail: " + user.userEmail);
                        var token = jwt.sign({userID: user._id, groups:user.groups}, app.get('secret'), {
                            expiresIn: '24h'
                        });
                        res.json({
                            success: true,
                            message: 'Token sent',
                            token: token,
                            username: user.username,
                            userid: user._id
                        });
                    }else{
                        console.log("Password is incorrect.");
                        res.json({success: false, message: "Email or password is incorrect."});
                    }
                });
            }else{
                res.json({success: false, message: "Login failed. User does not exist."});
            }
        }
    });
};

exports.googleAuth = function(req, res){
    var auth = new GoogleAuth;
    var client = new auth.OAuth2(config.CLIENT_ID, '', '');
    var token = req.body.token;

    console.log("Token: " + token);

    client.verifyIdToken(token, config.CLIENT_ID, function(err, login) {
        if(err){
            console.log("Google Token verification failed.");
            res.json({success:false, message: "Token verification failed."});
        }else{
            var payload = login.getPayload();
            var username = payload['name'];
            var userEmail = payload['email'];

            console.log("Checking if Google user exists...");
            User.find({userEmail:userEmail}).limit(1).exec(function(err, user){
                if(err){
                    console.log("Google Auth: failed to check for existing user.");
                    console.log(err);
                    res.json({success:false, message:"User check failed."})
                }else{
                    if(exists.length){
                        console.log(exists);

                        var token = jwt.sign({userID: user._id, groups:user.groups}, app.get('secret'), {
                            expiresIn: '24h'
                        });

                        res.json({
                            success: true,
                            message: 'Google user authenticated.',
                            token: token,
                            userid: user._id
                        });     
                    }else{
                        var newUser = new User({
                            username: username,
                            userEmail: userEmail,
                        });

                        newUser.save(function(err, user){
                            if(err){
                                console.log("Google Auth: couldn't save new user");
                                console.log(err);
                                res.json({success:false, message:"Couldn't save new user."});
                            }else{
                                var token = jwt.sign({userID: user._id, groups:user.groups}, app.get('secret'), {
                                    expiresIn: '24h'
                                });

                                res.json({
                                    success: true,
                                    message: 'New Google user added.',
                                    token: token,
                                    userid: user._id
                                });
                            }
                        });
                    }
                }
            });
        }
    });
};

exports.changeUsername = function(req, res){
    if(!req.body) return res.sendStatus(400);

    var userID = req.body.userid;
    var newUsername = req.body.username;
    console.log(userID + " " + newUsername);

    User.findOne({_id:userID}, function(err, user){
        if(err){
            console.log(err);
        }else{
            User.findOneAndUpdate({_id:userID}, {$set:{username:newUsername}}, function(err, results){
                console.log("Username changed " + results);
                res.json({success: true, message: "Username changed."});
            });
        }
    });
};

exports.changePassword = function(req, res){
    if(!req.body) return res.sendStatus(400);

    var userID = req.body.userid;
    var oldPassword = req.body.oldpassword;
    var newPassword = req.body.newpassword;
    console.log(userID + " " + oldPassword);

    User.findOne({_id:userID}, function(err, user){
        if(err){
            res.json({success: false, message:"Couldn't access database."});
            console.log("/changepassword: Couldn't access database to find user.");
            console.log(err);
        }else{
            user.comparePassword(oldPassword, function(err, isMatch){
                if(isMatch == true){
                    console.log("userPassword: ", isMatch);

                    user.userPassword = newPassword;
                    user.save(function(err, results){
                        if(err){
                            console.log(err);
                        }else{
                            console.log("Password changed: " + results);
                            res.json({success: true, message: "Password changed."});
                        }
                    });

                }else{
                    res.json({success:false, message: "Password wrong."});
                }
            });
        }
    });
};

exports.setAvatar = function(req, res){
    if(!req.file) return res.sendStatus(400);
    if(!req.body) return res.sendStatus(400);

    console.log("Name: " + req.file.originalname);
    console.log("Path: " + req.file.path);

    var userID = req.headers['userid'];
    fs.rename(req.file.path, req.file.destination + "avatars/" + userID + ".jpg", function(err, results){
        if(err){
            res.json({success: false, message: "Failed to save avatar."});
            console.log("/setavatar: renaming borked up");
            console.log(err);
        }else{
            res.json({success: true, message: "Avatar saved."});
        };
    });
};

exports.getMembers = function(req, res){
    if(!req.headers['groupid']) return res.sendStatus(400);
    
    console.log(req.headers['groupid']);

    var groupID = req.headers['groupid'];
    //console.log("GroupID: " + groupID);
    User.find({"groups.groupID":groupID}, function(err, members){
        if(err){
            res.json({success:false, message: "Couldn't access database."});
            console.log("Couldn't get list of users.");
            console.log(err);
        }else{
            if(members){
                res.json(members);
            }else{
                res.json(null);
            }
        }
    });
};

exports.getProfile = function(req, res){
    if(!req.headers['userid']) return res.sendStatus(400);

    var userID = req.headers['userid'];

    User.findOne({_id:userID}, 'username userEmail groups', function(err, profile){
        if(err){
            res.json({success: false, message: "Cannot access database."});
            console.log("/profile: Cannot access database to find user.");
            console.log(err);
        }else{
            if(profile){
                res.json(profile);
            }else{
                res.json({success: false, message: "No user by that email!"});
                console.log("/profile: Couldn't find user by that email.");
            }
        }
    });
};

exports.getInvites = function(req, res){
    if(!req.headers['userid']) return res.sendStatus(400);

    var userID = req.headers['userid'];

    User.findOne({_id:userID}, 'invites', function(err, invites){
        if(err){
            res.json({success: false, message: "Couldn't access database."});
            console.log("/getinvites: Cannot access database to get invites.");
            console.log(err);
        }else{
            if(invites){
                res.json(invites);
            }else{
                res.json({success: false, message: "No invites found."});
                console.log("/getInvites: No invites found.");
            }
        }
    });
};