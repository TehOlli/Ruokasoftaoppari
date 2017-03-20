var mong = require('mongoose');

var host = "localhost:27017";
var databaseName = "ruokasoftaoppari";
var dbUsername;
var dbPassword;

//`mongodb://${dbUsername}:${dbPassword}@${host}/${databaseName}`;

module.exports = {
    'secret' : 'salaisuus',
    'dbConnection' : `mongodb://${host}/${databaseName}`
};