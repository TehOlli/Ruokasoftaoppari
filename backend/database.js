var mong = require('mongoose');

var host = "localhost:27017";
var databaseName = "ruokasoftaoppari";
var dbUsername;
var dbPassword;


var dbConnection = `mongodb://${host}/${databaseName}`;

//`mongodb://${dbUsername}:${dbPassword}@${host}/${databaseName}`;

module.exports = dbConnection;