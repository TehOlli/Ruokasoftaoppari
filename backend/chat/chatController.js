var socketio = require('socket.io');
var jwt = require("jsonwebtoken");
var config = require("../config/config");
var Message = require("./messageModel.js");


var socketUsers = [];


exports.listen = function(app){

    var io = socketio.listen(app);  

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

        socket.on("storeUser", function(data){
            console.log("Saving socketUser... " + data);
            var socketUser = new Object();
            socketUser.userID = data;
            socketUser.socketID = socket.id;
            socketUsers.push(socketUser);
            console.log("Socket user saved!");
            console.log("socketUsers: " + socketUsers);
        });

        socket.on("room", function(room){
            socket.join(room);  
            console.log(room);
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

        socket.on("newVote", function(vote){
            var newVote = {"placeID":vote.place};
            Group.findOneAndUpdate({groupID:vote.room}, {$push:{voting: newVote}}, function(err){
                if(err){
                    console.log(err);
                }else{
                    socket.to(vote.room).emit("vote", vote);
                }
            });
        });

        socket.on("disconnect", function(){
            for(var i=0; i<socketUsers.length; i++){
                var u = socketUsers[i];

                if(u.socketID == socket.id){
                    socketUsers.splice(i, 1);
                    break;
                }
            }

            console.log("Socket user disconnected");
        });
    });

    exports.removeSocket = function(socketData, res){
        console.log("socketData: " + socketData.userID + " & " + socketData.room);
        for(var o = 0; o<socketUsers.length; o++){
            var r = socketUsers[o];

            console.log("UserID: " + r.userID);

            if(r.userID == socketData.userID){
                io.sockets.connected[r.socketID].leave(socketData.room);
                socketUsers.splice(r, 1);
                io.sockets.connected[r.socketID].emit("removedFromGroup", socketData.room);

                console.log("Socket removed from group.");
                res.json({success:true, message:"User removed"});
                break; 
            }
        }
    };

    exports.addPlace = function(placeData, res){
        console.log("addPlace here!");
        var data = {
            'place':placeData.placeID,
            'user':placeData.user
        }
        console.log("Emitting placeadded.");
        io.to(placeData.room).emit('placeadded', data);
        res.json({success: true, message: "Place added."});
    };

    exports.removePlace = function(placeData, res){
        io.to(placeData.room).emit('placeremoved', placeData.placeID);
        res.json({success: true, message: "Place removed."});
    };

    return io;
};

