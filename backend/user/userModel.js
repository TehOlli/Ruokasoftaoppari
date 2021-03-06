var mong = require('mongoose');
var bcrypt = require('bcryptjs');
var SALT_WORK_FACTOR = 10;

var groupsSchema = mong.Schema({
    groupID: String
}, {_id:false});

/*
var invitesSchema = mong.Schema({
    groupID: String,
    groupName: String
}, {_id:false});
*/

var userSchema = mong.Schema({
    username:{
        type: String,
        required: true
    }, 
    userEmail:{
        type: String,
        lowercase: true,
        required: true,
        index: { unique: true }
    },
    userPassword:{
        type: String,
        required: true
    },
    verified:{
        type: Boolean,
        required: true
    },
    GAuth:{
        type: Boolean,
        required: true
    },
    groups: [groupsSchema],
    invites: [{
        //type: Schema.Types.ObjectId, ref: 'Group'
        groupID: String,
        groupName: String
    }, {_id:false}]
});

//Hashes the user's password before Mongoose does a .save if it's been modified.
userSchema.pre('save', function(next){
    var user = this;

    if(!user.isModified('userPassword')) return next();
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
        if(err) return next(err);
        console.log(salt);
        bcrypt.hash(user.userPassword, salt, function(err, hash){
            if(err) return next(err);  

            user.userPassword = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function(candidatePassword, cb){
    bcrypt.compare(candidatePassword, this.userPassword, function(err, isMatch){
            if(err) return cb(err);
            cb(null, isMatch);
    });
}


var User = mong.model('User', userSchema);

module.exports = User;