var mong = require('mongoose');
var fs = require('fs');

//Server settings
var port = process.env.port || 8080;

//Database settings
var dbhost = "localhost:27017";
var databaseName = "ruokasoftaoppari";
var dbUsername;
var dbPassword;

//SSL settings
/*
var key = fs.readFileSync('key.txt');
var crt = fs.readFileSync('crt.txt');
var credentials ={
    key: key,
    cert: crt
};
*/

//`mongodb://${dbUsername}:${dbPassword}@${host}/${databaseName}`;

module.exports = {
    'secret' : 'salaisuus',
    'dbConnection' : `mongodb://${dbhost}/${databaseName}`,
    'CLIENT_ID' : '546073062554-fvurgo1ps4fhrn4plhkno8l26b07894s.apps.googleusercontent.com',
    //'credentials' : credentials,
    'port' : port
};