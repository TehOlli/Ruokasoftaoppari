var mong = require('mongoose');

/*
var members = mong.Schema({
    memberEmail: String
},{_id:false});
*/
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
    //subSchemaCollection: members
    members: [{
        memberID: String,
        required: true
    }],
    places: [{
        placeID:{
            type: String,
            required: true
        }
    }]
});

var Group = mong.model('Group', groupSchema);

module.exports = Group;