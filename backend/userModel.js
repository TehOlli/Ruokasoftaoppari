var mong = require('mongoose');

mong.connect("mongodb://localhost:27017/ruokasoftaoppari");
console.log("Mongo connected");
var userSchema = mong.Schema({
    username: String
})

var User = mong.model('users', userSchema);

exports.user = User;