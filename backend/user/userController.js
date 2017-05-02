var User                = require("./userModel");
var fs                  = require("fs");
var jwt                 = require("jsonwebtoken");
var express             = require("express");
var app                 = express();
var config              = require("../config");
var GoogleAuth = require('google-auth-library');

app.set('secret', config.secret);

exports.signUp = function(req, res){
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
        if(err){
            res.json({success:false, message: "Couldn't access database."});
            console.log("Couldn't access database.");
            console.log(err);
        }else{
            if(exists.length){
                console.log("User with that email already exists");
                console.log("User exists: " + exists);
                res.json({success: false, message: "User with that email already exists"});
            }else{
                newUser.save(function(err, results){
                    if (err){
                        res.json({success: false, message: "Couldn't save user to database."})
                        console.log("Couldn't save to database.");
                    }else{
                        console.log(results);
                        
                        var token = jwt.sign({userEmail: newUser.userEmail}, app.get('secret'), {
                            expiresIn: '24h'
                        });
                        res.json({
                            success: true,
                            message: 'Token sent',
                            token: token
                        });

                        User.findOne({username: userName}, function(err, user){
                            if(err){
                                res.json({success:false, message: "Couldn't confirm password."})
                                console.log("Couldn't confirm password");
                                console.log(err);
                            }else{
                                user.comparePassword(userPassword, function(err, isMatch){
                                    if(err) throw err;
                                    console.log("userPassword: ", isMatch);
                                });
                            }
                        });
                    }
                });
            }
        }
    });
};

exports.login = function(req, res){
    if(!req.body) return res.sendStatus(400);

    console.log("Hello, login here.");
    var userEmail = req.body.email;
    var userPassword = req.body.password;
    console.log(userEmail);
    
    User.findOne({userEmail: userEmail}, function(err, user){
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
                        var token = jwt.sign({userEmail: user.userEmail}, app.get('secret'), {
                            expiresIn: '24h'
                        });
                        res.json({
                            success: true,
                            message: 'Token sent',
                            token: token,
                            username: user.username
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
            console.log("Eipä onnistunut.")
            res.json({success:false, message: "Token verification failed."});
        }else{
            var payload = login.getPayload();
            var username = payload['name'];
            var userEmail = payload['email'];

            console.log("Checking if Google user exists...");
            User.find({userEmail:userEmail}).limit(1).exec(function(err, exists){
                if(err){
                    console.log("Google Auth: failed to check for existing user.");
                    console.log(err);
                    res.json({success:false, message:"User check failed."})
                }else{
                    if(exists.length){
                        console.log(exists);

                        var token = jwt.sign({userEmail: exists.userEmail}, app.get('secret'), {
                            expiresIn: '24h'
                        });

                        res.json({
                            success: true,
                            message: 'Google user authenticated.',
                            token: token
                        });     
                    }else{
                        var newUser = new User({
                            username: username,
                            userEmail: userEmail,
                        });

                        newUser.save(function(err){
                            if(err){
                                console.log("Google Auth: couldn't save new user");
                                console.log(err);
                                res.json({success:false, message:"Couldn't save new user."});
                            }else{
                                var token = jwt.sign({userEmail: newUser.userEmail}, app.get('secret'), {
                                    expiresIn: '24h'
                                });

                                res.json({
                                    success: true,
                                    message: 'New Google user added.',
                                    token: token
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

    var userEmail = req.body.email;
    var newUsername = req.body.username;
    console.log(userEmail + " " + newUsername);

    User.findOne({userEmail:userEmail}, function(err, user){
        if(err){
            console.log(err);
        }else{
            User.findOneAndUpdate({userEmail:userEmail}, {$set:{username:newUsername}}, function(err, results){
                console.log("Username changed " + results);
                res.json({success: true, message: "Username changed."});
            });
        }
    });    
};

exports.changePassword = function(req, res){
    if(!req.body) return res.sendStatus(400);

    var userEmail = req.body.email;
    var oldPassword = req.body.oldpassword;
    var newPassword = req.body.newpassword;
    console.log(userEmail + " " + oldPassword);

    User.findOne({userEmail:userEmail}, function(err, user){
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

    var userEmail = req.headers['email'];
    fs.rename(req.file.path, req.file.destination + "avatars/" + userEmail + ".jpg", function(err, results){
        if(err){
            res.json({success: false, message: "Failed to save avatar."});
            console.log("/setavatar: renaming borked up");
            console.log(err);
        }else{
            res.json({success: true, message: "Avatar saved."});
        };
    });
};

exports.getUsers = function(req, res){
    if(!req.headers['id']) return res.sendStatus(400);
    
    groupID = req.headers['id'];
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
    if(!req.headers['email']) return res.sendStatus(400);

    userEmail = req.headers['email'];

    User.findOne({userEmail:userEmail}, 'username userEmail groups', function(err, profile){
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
    if(!req.headers['email']) return res.sendStatus(400);

    userEmail = req.headers['email'];

    User.findOne({userEmail:userEmail}, 'invites', function(err, invites){
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