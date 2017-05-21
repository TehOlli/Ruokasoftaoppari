var mong = require('mongoose');

var messageSchema = mong.Schema({
    groupID:{
        type: String,
        required: true
    },
    msg:{
        type: String,
        required: true
    },
    author:{
        type: String,
        required: true
        //ref
    },
    username:{
        type: String,
        required: true
    },
    date:{
        type: String,
        required: true
    },
    time:{
        type: String,
        required: true
    }
});

var Message = mong.model('message', messageSchema);

module.exports = Message;