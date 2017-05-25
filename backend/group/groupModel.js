var mong = require('mongoose');

var memberSchema = mong.Schema({
    memberID: String
},{_id:false});

var votingSchema = mong.Schema({
    userID: String,
    placeID: String
}, {_id:false});

var placeSchema = mong.Schema({
    placeID:{
        type: String,
    }
}, {_id:false});;

var groupSchema = mong.Schema({
    groupName:{
        type: String,
        required: true
    },
    groupAdmin:{
        type: String,
        required: true
    },
    groupDesc:{
        type: String,
        required: true
    },
    members: [memberSchema],
    places: [placeSchema],
    voting: [votingSchema]
});

var Group = mong.model('Group', groupSchema);

module.exports = Group;