var mong = require('mongoose');

var userSchema = mong.Schema({
    username:{
        type: String,
        unique: true,
        required: true
    }, 
    userEmail:{
        type: String,
        lowercase: true,
        unique: true,
        required: true
    }
});

var User = mong.model('users', userSchema);

module.exports = User;