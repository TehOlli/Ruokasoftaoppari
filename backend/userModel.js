var mong = require('mongoose');
var dbConnection = require ('../backend/database');

mong.connect(dbConnection);
console.log("Mongo connected");
var userSchema = mong.Schema({
    username: String,
    userEmail: String
})

var User = mong.model('users', userSchema);

module.exports = User;