var mong = require('mongoose');

var messageSchema = mong.Schema({
    groupID:{
        type: String,
        required: true
    },
    message:{
        type: String,
        required: true
    },
    author:{
        type: String,
        required: true
        //ref
    }
});

var Message = mong.model('message', messageSchema);

module.exports = Message;