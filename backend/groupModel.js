var mong = require('mongoose');

/*
var members = mong.Schema({
    memberEmail: String
},{_id:false});
*/
var groupSchema = mong.Schema({
    groupName:{
        type: String,
        unique: true,
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
        memberEmail: String
    }]
});

var Group = mong.model('groups', groupSchema);

module.exports = Group;