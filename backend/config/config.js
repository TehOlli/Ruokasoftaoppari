var mong = require('mongoose');
var fs = require('fs');

//Server settings
var port = process.env.port || 8080;
var secret = fs.readFileSync('./config/secret.txt');

//Database settings
var dbhost = "localhost:27017";
var databaseName = "ruokasoftaoppari";
var dbUsername;
var dbPassword;


//SSL settings - using Nginx as reverse proxy so not doing HTTPS in the app
/*
var key = fs.readFileSync('PATH/privkey.pem');
var cert = fs.readFileSync('PATH/fullchain.pem');
//var ca = fs.readFileSync('PATH/chain.pem');
var credentials ={
    key: key,
    cert: cert,
    //ca: ca
};
*/

//`mongodb://${dbUsername}:${dbPassword}@${host}/${databaseName}`;

module.exports = {
    'secret' : secret,
    'dbConnection' : `mongodb://${dbhost}/${databaseName}`,
    'CLIENT_ID' : '767186635156-c8rj81hi36717j1o1qukkdfbhacou9fp.apps.googleusercontent.com',
    //'credentials' : credentials,
    'port' : port
};