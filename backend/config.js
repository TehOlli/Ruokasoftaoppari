var mong = require('mongoose');

var host = "localhost:27017";
var databaseName = "ruokasoftaoppari";
var dbUsername;
var dbPassword;

//`mongodb://${dbUsername}:${dbPassword}@${host}/${databaseName}`;

module.exports = {
    'secret' : 'salaisuus',
    'dbConnection' : `mongodb://${host}/${databaseName}`,
    'GOOGLE_CLIENT_ID' : '546073062554-fvurgo1ps4fhrn4plhkno8l26b07894s.apps.googleusercontent.com',
    'GOOGLE_CLIENT_SECRET' : '2ZaKr4gdsbe33bfGNHhhM-_0'
};