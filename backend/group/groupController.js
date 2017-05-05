var Group               = require("./groupModel");
var User                = require("../user/userModel");
var Message             = require("../messageModel");
var fs                  = require('fs');



exports.createGroup = function(req, res){
    if(!req.body) return res.sendStatus(400);

    console.log(req.body);

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
            res.json({success: false, message: "Couldn't save to database."});
        }else{
            console.log("Results " + results);
            var groupID = results._id;
            
            var newMember = {"memberID":groupAdmin};
            Group.findOneAndUpdate({_id: groupID}, {$push:{members: newMember}}, function(err, group){
                if (err){
                    console.log("Couldn't add member to group's array in database.");
                    console.log(err);
                    res.json({success:false, message: "Couldn't add member to group's array in database."});
                }else{
                    console.log("Admin added to group's members array")         
                    var newGroup = {"groupID": groupID};
                    User.findOneAndUpdate({_id: groupAdmin}, {$push:{groups: newGroup}}, function(err, user){
                        if (err){
                            console.log("Couldn't add group to user's array in database.");
                            console.log(err);
                            res.json({success:false, message: "Couldn't add group to user's array in database."});
                        }else{
                            console.log("Group added to admin's groups array");
                            console.log("Luotu ryhmä: " + group);
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

    if(groupName && groupDesc){
        Group.findOneAndUpdate({_id:groupID}, {groupName:groupName, groupDesc:groupDesc}, function(err, group){
            if(err){
                res.json({success:false, message:"Update failed."});
                console.log("/alterGroup: couldn't update group");
            }else{
                if(group){
                    res.json({success:true, message: "Changed group name and description."});
                }else{
                    console.log("Something went wrong.");
                }
            }
        });
    }else if(groupName){
        Group.findOneAndUpdate({_id:groupID}, {groupName:groupName}, function(err, group){
            if(err){
                res.json({success:false, message:"Update failed."});
                console.log("/alterGroup: couldn't update group");
            }else{
                res.json({success:true, message: "Changed group name."});
            }
        });
    }else if(groupDesc){
        Group.findOneAndUpdate({_id:groupID}, {groupDesc:groupDesc}, function(err, group){
            if(err){
                res.json({success:false, message:"Update failed."});
                console.log("/alterGroup: couldn't update group");               
            }else{
                res.json({success:true, message: "Changed group description."});
            }
        });
    }
};

exports.getGroups = function(req, res){
    if(!req.headers['userid']) return res.sendStatus(400);

    Group.find({'members.memberID': req.headers['userid']}, function(err, groups){
        if(err){
            res.json({success:false, message: "Couldn't access database."});
            console.log("Couldn't get list of groups.");
            console.log(err);
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
            res.json({success: false, message: "Couldn't fetch group."})
            console.log("/getGroup: couldn't fetch group.");
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

exports.invitetoGroup = function(req, res){
    if(!req.body) return res.sendStatus(400);

    var groupID = req.body.groupid;
    var groupName = req.body.name;
    var userID = req.body.userid;
    console.log("inviteToGroup parameters: groupID " + groupID + " & " + userEmail);

    //Checks if user is already in that group
    User.find({userEmail: userEmail, "groups.groupID": groupID}, function(err, exists2){
        if (err){
            res.json({success: false, message: "Cannot access database."});
            console.log("/invitetogroup: Cannot access database to search for user.")
            console.log(err);
        }else{
            if(exists2.length){
                console.log("User is already in the group");
                //console.log(exists2);
                res.json({success: false, message: "That user is already in the group."});
            }else{
                var invite = {groupID: groupID, groupName: groupName};
                User.findOneAndUpdate({_id: userID}, {$push:{invites: invite}}, function(err, user){
                    if(err){
                        res.json({success: false, message: "Cannot access database."});
                        console.log("/invitetogroup: Cannot access database to update user.");
                        console.log(err);
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
    if(!req.headers['userid']) return res.sendStatus(400);

    var userID = req.body.userid;
    var groupID = req.body.groupid;

    var group = {groupID: groupID};
    User.findOneAndUpdate({_id:userID, 'invites.groupID':groupID}, {$pull:{invites:{groupID:groupID}}, $push:{groups:group}}, function(err, user){
        if(err){
            res.json({success: false, message: "Couldn't access database."});
            console.log("/joinGroup: Couldn't access database to accept invite");
            console.log(err);
        }else{
            console.log(user);
            var newMember = {"memberID":userID};
            Group.findOneAndUpdate({_id:groupID}, {$push:{members: newMember}}, function(err, group){
                if (err){
                    res.json({success: false, message: "Cannot access database."});
                    console.log("/acceptInvitation: Cannot access database to update group.");
                    console.log(err);
                }else{
                    if(user){
                        console.log("Joined group.");
                        console.log(user);
                        res.json({success: true, message: "Joined group."});
                    }else{
                        console.log("/acceptInvitation: that user does not exist");
                    }
                }
            });            
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
            res.json({success: false, message: "Couldn't access database."});
            console.log("/declineInvitation: Couldn't access database to decline invite");
            console.log(err);
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
            res.json({success:false, message: "Couldn't access database."});
            console.log("/removefromgroup: Couldn't access database to update user.");
            console.log(err);
        }else{
            console.log("Removed group from user document");
        
            Group.findOneAndUpdate({_id:groupID}, {$pull:{members:{memberID:userID}}}, function(err, group){
                if (err){
                    res.json({success:false, message: "Couldn't access database."});
                    console.log("/removefromgroup: Couldn't access database to update group.");
                    console.log(err);
                }else{
                    console.log("Removed user from group document");

                    res.json({success:true, message:"User removed"});
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
            res.json({success:false, message:"Failed to delete group."});
            console.log("Failed to delete group.");
            console.log(err);
        }else{
            console.log("Deleted group.")

            User.update({"groups.groupID":groupID}, {$pull:{groups:{groupID:groupID}}} , function(err, members){
                console.log("Removed group from users' member arrays.")

                fs.unlink("./public/uploads/groups/" + groupID + ".jpg", function(err){
                    if(err){
                        console.log("deleteGroup: couldn't delete groupimg");
                        console.log(err);
                    }
                    res.json({success:true, message:"Group deleted"});
                });
                
            });
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
            res.json({success: false, message: "Failed to save group image."});
            console.log("/setgroupimage: renaming borked up");
            console.log(err);
        }else{
            res.json({success: true, message: "Group image saved."});
            console.log("Kuva tallennettu");
        }
    });
};

exports.getMessages = function(req, res){
    if(!req.headers['groupid']) return res.sendStatus(400);

    var groupID = req.headers['id'];

    console.log("Fetching messages for group " + groupID);

    Message.find({groupID:groupID}, function(err, results){
        console.log("Messages: " + results);
        res.json(results);
    });
};

exports.savePlace = function(req, res){
    if(!req.body) return res.sendStatus(400);

    var groupID = req.body.groupid;
    var placeID = req.body.placeid;

    console.log("Saving place " + placeID + " to group " + groupID);

    var place = {placeID:placeID};
    Group.find({_id:groupID, places:{placeID:placeID}}).limit(1).exec(function(err, exists){
        if(err){
            console.log(err);
        }else{
            if(exists.length){
                console.log("Place is already on the list.");
                res.json({success:false, message:"Place is already on the list."});
            }else{
                Group.findOneAndUpdate({_id:groupID}, {$push:{places:place}}, function(err, group){
                    if(err){
                        console.log("/savePlace: Couldn't save location to database.");
                        console.log(err);
                        res.json({success:false, message: "Couldn't save location."});
                    }else{
                        res.json({success:true, message: "Location saved."});
                    }
                });
            }
        }

    })

};

exports.getPlaces = function(req, res){
    if(!req.headers['groupid']) return res.sendStatus(400);

    var groupID = req.headers['groupid'];

    Group.findOne({_id:groupID}).select('places.placeID').exec(function(err, places){
        if(err){
            console.log("/getplaces: Couldn't get list of places.")
            console.log(err);
            res.json({success:false, message: "Couldn't get places."});
        }

        res.json(places);
    });
};

exports.deletePlace = function(req, res){
    if(!req.body) return res.sendStatus(400);
    
    
    var groupID = req.body.groupID;
    var placeID = req.body.placeID;
    
    console.log("Deleting place " + placeID + " from group " + groupID);

    Group.findOneAndUpdate({_id:groupID}, {$pull:{places:{placeID:placeID}}}, function(err, group){
        if(err){
            console.log("/deletePlace: Couldn't delete location from database.");
            console.log(err);
            res.json({success:false, message: "Couldn't delete location."});
        }else{
            res.json({success: true, message: "Location deleted."});
        }
    });
};