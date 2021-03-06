var Group               = require("./groupModel");
var User                = require("../user/userModel");
var Message             = require("../chat/messageModel");
var chat                = require("../chat/chatController.js");
var fs                  = require('fs');



exports.createGroup = function(req, res){
    if(!req.body) return res.sendStatus(400);

    var groupName = req.body.groupname;
    var groupAdmin = req.body.userid;
    var groupDesc = req.body.description;

    var newGroup = new Group({
        groupName: groupName,
        groupAdmin: groupAdmin,
        groupDesc: groupDesc
    });

    newGroup.save(function(err, results){
        if (err){
            console.log("Couldn't save new group to database.");
            console.log(err);
            return res.status(500).send({
                    success: false,
                    message: "Database error.", 
            });
        }else{
            console.log("Results " + results);
            var groupID = results._id;
            
            var newMember = {"memberID":groupAdmin};
            Group.findOneAndUpdate({_id: groupID}, {$push:{members: newMember}}, function(err, group){
                if (err){
                    console.log("Couldn't add member to group's array in database.");
                    console.log(err);
                    return res.status(500).send({
                            success: false,
                            message: "Database error.", 
                    });    
                }else{
                    console.log("Admin added to group's members array")         
                    var newGroup = {"groupID": groupID};
                    User.findOneAndUpdate({_id: groupAdmin}, {$push:{groups: newGroup}}, function(err, user){
                        if (err){
                            console.log("Couldn't add group to user's array in database.");
                            console.log(err);
                            return res.status(500).send({
                                success: false,
                                message: "Database error.", 
                            }); 
                            }else{
                            console.log("Group added to admin's groups array");
                            res.json({
                                success: true,
                                message: 'Group created',
                                group
                            });
                        }
                    });
                }
            });
        }
    });
};

exports.alterGroup = function(req, res){
    if(!req.body) return res.sendStatus(400);

    var groupID = req.body.groupid;
    var groupName = req.body.name;
    var groupDesc = req.body.desc;

    console.log("GroupID: " + groupID);
    console.log("GroupName: " + groupName);
    console.log("GroupDesc: " + groupDesc);

    if(groupName){
        Group.findOneAndUpdate({_id:groupID}, {groupName:groupName}, function(err, group){
            if(err){
                console.log("/alterGroup: couldn't update group");
                return res.status(500).send({
                    success: false,
                    message: "Database error.", 
                });
            }else{
                if(group){
                    res.json({success:true, message: "Changed group name."});
                }else{
                    console.log("alterGroup hit a non-existent group.")
                    res.json({success: false, message: "No such group exists."});                    
                }
            }
        });
    }else if(groupDesc){
        Group.findOneAndUpdate({_id:groupID}, {groupDesc:groupDesc}, function(err, group){
            if(err){
                console.log("/alterGroup: couldn't update group");
                return res.status(500).send({
                    success: false,
                    message: "Database error.", 
                });             
            }else{
                if(group){
                    res.json({success:true, message: "Changed group description."});
                }else{
                    console.log("alterGroup hit a non-existent group.")
                    res.json({success: false, message: "No such group exists."});                   
                }
            }
        });
    }
};

exports.getGroups = function(req, res){
    if(!req.headers['userid']) return res.sendStatus(400);

    Group.find({'members.memberID': req.headers['userid']}, '_id groupName groupDesc groupAdmin', function(err, groups){
        if(err){
            console.log("Couldn't get list of groups.");
            console.log(err);
            return res.status(500).send({
                    success: false,
                    message: "Database error.", 
            });      
        }else{
            res.json(groups);
        }     
    });
};

exports.getGroup = function(req, res){
    if(!req.headers['groupid']) return res.sendStatus(400);

    var groupID = req.headers['groupid'];
    console.log(groupID);

    Group.findOne({_id:groupID}, function(err, group){
        if(err){
            console.log("/getGroup: couldn't fetch group.");
            return res.status(500).send({
                    success: false,
                    message: "Database error.", 
            });    
        }else{
            if(group){
                console.log(group);
                res.json(group);
            }else{
                res.json({success:false, message: "That group does not exist."});
            }
        }
    });
};

exports.invite = function(req, res){
    if(!req.body) return res.sendStatus(400);

    var groupID = req.body.groupid;
    var groupName = req.body.name;
    var userEmail = req.body.email;
    console.log("inviteToGroup parameters: groupID " + groupID + " & " + userEmail);

    User.find({userEmail: userEmail, "groups.groupID": groupID}, function(err, exists){
        if (err){
            console.log("/invitetogroup: Cannot access database to search for user.")
            console.log(err);
            return res.status(500).send({
                    success: false,
                    message: "Database error.", 
            });    
        }else{
            if(exists.length){
                console.log("User is already in the group");
                res.json({success: false, message: "That user is already in the group."});
            }else{
                var invite = {groupID: groupID, groupName: groupName};
                User.findOneAndUpdate({userEmail: userEmail}, {$addToSet:{invites: invite}}, function(err, user){
                    if(err){
                        console.log("/invitetogroup: Cannot access database to update user.");
                        console.log(err);
                        return res.status(500).send({
                                success: false,
                                message: "Database error.", 
                        });    
                    }else{
                        if(user){
                            console.log("User exists");
                            console.log("Invite sent");

                            res.json({success: true, message: "Invite sent."});
                        }else{
                            console.log("User does not exist.");
                            console.log(user);

                            res.json({success: false, message: "No user with that email exists."});
                        }
                    }
                });
            }
        }
    });
};

exports.acceptInvitation = function(req, res){
    if(!req.body) return res.sendStatus(400);

    var userID = req.body.userid;
    var groupID = req.body.groupid;

    console.log("userID: " + userID + " & groupID: " + groupID);

    var group = {groupID: groupID};
    User.findOneAndUpdate({_id:userID, 'invites.groupID':groupID}, {$pull:{invites:{groupID:groupID}}, $push:{groups:group}}, function(err, user){
        if(err){
            console.log("/joinGroup: Couldn't access database to accept invite");
            console.log(err);
            return res.status(500).send({
                success: false,
                message: "Database error.", 
            });    
        }else{
            if(user){
                console.log(user);
                var newMember = {"memberID":userID};
                Group.findOneAndUpdate({_id:groupID}, {$push:{members: newMember}}, function(err, group){
                    if (err){
                        console.log("/acceptInvitation: Cannot access database to update group.");
                        console.log(err);
                        return res.status(500).send({
                            success: false,
                            message: "Database error.", 
                        });    
                    }else{
                        if(group){
                            console.log("Joined group.");
                            console.log(group);
                            res.json({success: true, message: "Joined group."});
                        }else{
                            console.log("/acceptInvitation: that group does not exist");
                            return res.status(404).send({
                                success: false,
                                message: "That group does not exist." 
                            });    
                        }
                    }
                });    
            }else{
                console.log("/acceptInvitation: that group does not exist");
                return res.status(404).send({
                    success: false,
                    message: "That invite does not exist."
                });   
            }        
        }
    })
};

exports.declineInvitation = function(req, res){
    if(!req.body) return res.sendStatus(400);
    if(!req.headers['userid']) return res.sendStatus(400);

    var userID = req.body.userid;
    var groupID = req.body.groupid;

    User.findOneAndUpdate({_id:userID, 'invites.groupID':groupID}, {$pull:{invites:{groupID:groupID}}}, function(err, user){
        if(err){
            console.log("/declineInvitation: Couldn't access database to decline invite");
            console.log(err);
            return res.status(500).send({
                success: false,
                message: "Database error.", 
            });    
        }else{
            if(user){
                res.json({success: true, message: "Declined invitation."});
                console.log("Declined invitation.");
            }else{
                console.log("/declineInvitation: that user does not exist");
            }
            
        }
    }) 
};

exports.removefromGroup = function(req, res){
    if(!req.body) return res.sendStatus(400);

    var groupID = req.body.groupid;
    var userID = req.body.userid;

    console.log("Removing " + userID + " from " + groupID);

    User.findOneAndUpdate({_id:userID}, {$pull:{groups:{groupID:groupID}}}, function(err, user){
        if (err){
            console.log("/removefromgroup: Couldn't access database to update user.");
            console.log(err);
            return res.status(500).send({
                    success: false,
                    message: "Database error.", 
            });    
        }else{
            console.log("Removed group from user document");
        
            Group.findOneAndUpdate({_id:groupID}, {$pull:{members:{memberID:userID}}}, function(err, group){
                if (err){
                    console.log("/removefromgroup: Couldn't access database to update group.");
                    console.log(err);
                    return res.status(500).send({
                        success: false,
                        message: "Database error.", 
                    });    
                }else{
                    console.log("Removed user from group document");

                    var socketData = {
                        "userID": userID,
                        "room": groupID
                    }

                    console.log("socketData: " + socketData.userID + " & " + socketData.room);

                    chat.removeSocket(socketData, res, function(err){
                        if(err){
                            console.log("Removing socket failed!");
                            console.log(err);
                            res.json({success:true, message:"User removed"});
                        }
                    });
                }
            });
        }
    });
};

exports.deleteGroup = function(req, res){
    if(!req.body) return res.sendStatus(400);

    var groupID = req.body.groupid;

    console.log("Deleting group " + groupID);

    Group.remove({_id:groupID}, function(err, results){
        if (err){

        }else{
            console.log("Deleted group.")
            Message.remove({groupID:groupID}, function(err){
                    if(err){
                        console.log("Failed to delete group's messages.");
                        console.log(err);
                        return res.status(500).send({
                            success: false,
                            message: "Database error.", 
                        });    
                    }else{
                        User.update({"groups.groupID":groupID}, {$pull:{groups:{groupID:groupID}}} , function(err, members){
                        console.log("Removed group from users' member arrays.")

                        fs.unlink("./public/uploads/groups/" + groupID + ".jpg", function(err){
                            if(err){
                                console.log("deleteGroup: couldn't delete groupimg");
                                console.log(err);
                                res.json({success:true, message:"Group deleted"});
                            }else{
                                res.json({success:true, message:"Group deleted"});
                            }
                        });
                    });
                }
            })
        }
    });
};

exports.setGroupImage = function(req, res){
    if(!req.file) return res.sendStatus(400);
    if(!req.body) return res.sendStatus(400);
    if(!req.headers['groupid']) return res.sendStatus(400);

    console.log("Name: " + req.file.originalname);
    console.log("Path: " + req.file.path);

    var groupID = req.headers['groupid'];
    fs.rename(req.file.path, req.file.destination + "groups/" + groupID + ".jpg", function(err, results){
        if(err){
            console.log("/setgroupimage: renaming borked up");
            console.log(err);
            return res.status(500).send({
                success: false,
                message: "Database error.", 
            });    
        }else{
            res.json({success: true, message: "Group image saved."});
            console.log("Kuva tallennettu");
        }
    });
};

exports.saveMessage = function(err, callback){
    var yeah = "Yeah";
    callback(null, yeah);
};

exports.getMessages = function(req, res){
    if(!req.headers['groupid']) return res.sendStatus(400);

    var groupID = req.headers['groupid'];

    console.log("Fetching messages for group " + groupID);

    if(groupID.length){
        Message.find({groupID:groupID}, function(err, messages){
            if(err){
                return res.status(500).send({
                    success: false,
                    message: "Database error.", 
                });    
            }else{
                console.log("Messages: " + messages);
                res.json(messages);
            }
        });
    }else{
        return res.sendStatus(400);
    }
};

exports.savePlace = function(req, res){
    if(!req.body) return res.sendStatus(400);

    var groupID = req.body.groupid;
    var placeID = req.body.placeid;

    console.log("Saving place " + placeID + " to group " + groupID);

    var place = {placeID:placeID};
    Group.find({_id:groupID, places:{placeID:placeID}}).limit(1).exec(function(err, exists){
        if(err){
            console.log("savePlace failed to search for group");
            console.log(err);
            return res.status(500).send({
                success: false,
                message: "Database error.", 
            });    
        }else{
            if(exists.length){
                console.log("Place is already on the list.");
                res.json({success:false, message:"Place is already on the list."});
            }else{
                Group.findOneAndUpdate({_id:groupID}, {$addToSet:{places:place}}, function(err, group){
                    if(err){
                        console.log("/savePlace: Couldn't save location to database.");
                        console.log(err);
                        return res.status(500).send({
                            success: false,
                            message: "Database error.", 
                        });    
                    }else{
                        var placeData = {
                            "placeID": placeID,
                            "room": groupID,
                            "user": req.headers['userid']
                        }
                        console.log("Calling chat.addPlace...");
                        chat.addPlace(placeData, res, function(err){
                            if(err){
                                console.log("Couldn't emit a placeadded event!");
                                console.log(err);
                                res.json({success:true, message:"The place was removed but your friends didn't get the message!"});
                            }
                        });
                    }
                });
            }
        }
    })
};

exports.getPlaces = function(req, res){
    if(!req.headers['groupid']) return res.sendStatus(400);

    var groupID = req.headers['groupid'];

    if(groupID.length){
        Group.findOne({_id:groupID}, 'places.placeID voting', function(err, places){
            if(err){
                console.log("/getplaces: Couldn't get list of places.")
                console.log(err);
                return res.status(500).send({
                        success: false,
                        message: "Database error.", 
                });    
            }else{
                console.log("Places:" + places);
                console.log("Votes:" + places.voting);
                res.json(places);
            }
        });
    }else{
        return res.sendStatus(400);
    }
};

exports.deletePlace = function(req, res){
    if(!req.body) return res.sendStatus(400);
    
    
    var groupID = req.body.groupid;
    var placeID = req.body.placeid;
    
    console.log("Deleting place " + placeID + " from group " + groupID);

    Group.findOneAndUpdate({_id:groupID}, {$pull:{places:{placeID:placeID}}}, function(err, group){
        if(err){
            console.log("/deletePlace: Couldn't delete location from database.");
            console.log(err);
            return res.status(500).send({
                success: false,
                message: "Database error.", 
            });    
        }else{
            var placeData = {
                "placeID": placeID,
                "room": groupID,
                "user": req.headers['userid']
            }

            chat.removePlace(placeData, res, function(err){
                if(err){
                    console.log("Couldn't emit a placeremoved event!");
                    console.log(err);
                    res.json({success:true, message:"The place was removed but your friends didn't get the message!"});
                }
            });
        }
    });
};