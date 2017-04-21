var mong = require('mongoose');
var bodyParser = require("body-parser");

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
        memberEmail: String
    }]
});

var Group = mong.model('Group', groupSchema);

module.exports = Group;