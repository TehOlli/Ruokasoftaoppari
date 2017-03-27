var mong = require('mongoose');

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
    members: [{
        userEmail: String
    }]
});

var Group = mong.model('groups', groupSchema);

module.exports = Group;