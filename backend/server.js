var express = require('express');
var app     = express();
var port    = process.env.port || 8080;

//Routing

app.get('/testi', function(req, res){
    res.send('OH SHIT SON IT WORKS!');
});

app.listen(port);
console.log('Yeah, boiz, stuff on port ' + port);