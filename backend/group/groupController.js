var Group               = require("./groupModel");
var User                = require("../user/userModel");
var Message             = require("../messageModel");
var fs                  = require('fs');

exports.getGroups = function(req, res){
    if(!req.headers['email']) return res.sendStatus(400);

    Group.find({'members.memberEmail': req.headers['email']}, function(err, groups){
        if(err){
            res.json({success:false, message: "Couldn't access database."});
            console.log("Couldn't get list of groups.");
            console.log(err);
        }else{
            res.json(groups);
        }     
    });
};

exports.createGroup = function(req, res){
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
        if (err){
            res.json({success: false, message: "Couldn't save to database."});
            console.log("Couldn't save new group to database.");
            console.log(err);
        }else{
            console.log("Results " + results);
            var groupID = results._id;
            console.log("GroupID: " + groupID);
            console.log("GroupAdmin: " + groupAdmin);
            
            console.log("mitäs helvettiä groupAdmin:" +groupAdmin);
            var newMember = {"memberEmail":groupAdmin};
            Group.findOneAndUpdate({_id: groupID}, {$push:{members: newMember}}, function(err, group){
                if (err){
                    res.json({success:false, message: "Couldn't add member to group's array in database."});
                    console.log("Couldn't add member to group's array in database.");
                    console.log(err);
                }else{
                    console.log("Admin added to group's members array")         
                    var newGroup = {"groupID": groupID};
                    User.findOneAndUpdate({userEmail: groupAdmin}, {$push:{groups: newGroup}}, function(err, user){
                        if (err){
                            res.json({success:false, message: "Couldn't add group to user's array in database."});
                            console.log("Couldn't add group to user's array in database.");
                            console.log(err);
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

exports.invitetoGroup = function(req, res){
    if(!req.body) return res.sendStatus(400);

    var groupID = req.body.id;
    var userEmail = req.body.email;
    console.log("inviteToGroup parameters: groupID " + groupID + " & " + userEmail);

    //Checks if user is already in that group
    User.find({userEmail: userEmail, "groups.groupID": groupID}, function(err, exists2){
        if (err){
            res.json({success: false, message: "Cannot access database."});
            console.log("/invitetogroup: Cannot access database to search for user.")
            console.log(err);
        }else{
            console.log("InvitetoGroup exists2:" + exists2);
            if(exists2.length){
                console.log("User is already in the group");
                //console.log(exists2);
                res.json({success: false, message: "That user is already in the group."});
            }else{
                var invite = {groupID: groupID};
                User.findOneAndUpdate({userEmail: userEmail}, {$push:{invites: invite}}, function(err, user){
                    if(err){
                        res.json({success: false, message: "Cannot access database."});
                        console.log("/invitetogroup: Cannot access database to update user.");
                        console.log(err);
                    }else{
                        if(user){
                            console.log("User exists");
                            console.log("Invite sent");

                            res.json({success: true, message: "Invite sent."});
                        }
                    }
                });



                /*
                var newGroup = {"groupID": groupID};
                User.findOneAndUpdate({userEmail: userEmail}, {$push:{groups: newGroup}}, function(err, user){
                    if (err){
                        res.json({success: false, message: "Cannot access database."});
                        console.log("/invitetogroup: Cannot access database to update user.");
                        console.log(err);
                    }else{     
                        if(user){
                            console.log("User exists.");

                            var newMember = {"memberEmail":userEmail};
                            Group.findOneAndUpdate({_id:groupID}, {$push:{members: newMember}}, function(err, group){
                                if (err){
                                    res.json({success: false, message: "Cannot access database."});
                                    console.log("/invitetogroup: Cannot access database to update group.");
                                    console.log(err);
                                }else{
                                    console.log("User added to group members");

                                    res.json({success:true, message:"User added"});
                                }
                            });
                        }else{
                            console.log("User with that email does not exist");
                            res.json({success:false, message:"User with that email does not exist"});
                        }
                    }
                });
                */
            }
        }
    });
};

exports.joinGroup = function(req, res){
    if(!req.body) return res.sendStatus(400);

    var userEmail = req.body.email;
    var groupID = req.body.id;

    User.findOneAndUpdate({userEmail:userEmail, invites: groupID}, {$pull:{invites:groupID}, $push:{groups:groupID}}, function(err, user){
        if(err){
            res.json({success: false, message: "Couldn't access database."});
            console.log("/joinGroup: Couldn't access database to accept invite")
        }else{
            console.log("Joined group.");
            console.log(user);
            res.json({success: true, message: "Joined group."});
        }
    })
};

exports.removefromGroup = function(req, res){
    if(!req.body) return res.sendStatus(400);

    var groupID = req.body.groupid;
    var userEmail = req.body.email;

    console.log("Removing " + userEmail + " from " + groupID);

    User.findOneAndUpdate({userEmail:userEmail}, {$pull:{groups:{groupID:groupID}}}, function(err, user){
        if (err){
            res.json({success:false, message: "Couldn't access database."});
            console.log("/removefromgroup: Couldn't access database to update user.");
            console.log(err);
        }else{
            console.log("Removed group from user document");
        
            Group.findOneAndUpdate({_id:groupID}, {$pull:{members:{memberEmail:userEmail}}}, function(err, group){
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

                res.json({success:true, message:"Group deleted"});
            });
        }
    });
};

exports.setGroupImage = function(req, res){
    if(!req.file) return res.sendStatus(400);
    if(!req.body) return res.sendStatus(400);

    console.log("Name: " + req.file.originalname);
    console.log("Path: " + req.file.path);

    var groupID = req.headers['id'];
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
    if(!req.headers['id']) return res.sendStatus(400);

    var groupID = req.headers['id'];

    console.log("Fetching messages for group " + groupID);

    Message.find({groupID:groupID}, function(err, results){
        console.log("Messages: " + results);
        res.json(results);
    });
};