var mong = require('mongoose');

var memberSchema = mong.Schema({
    userID: String,
    userEmail: String,
    username: String
}, {_id:false});

var memberSchema = mong.Schema({
    groupID:{
        type: mongoose.Schema.Types.ObjectId, ref: 'Group',
        required: true
    },
    groupName:{
        type: String,
        required: true
    },
    members: [memberSchema]
});

var Member = mong.model('Member', memberSchema);

module.exports = Group;