var nm = require('nodemailer');
var gmail = require('./gmail.js');
var config = require('./config.js')

var smtp = nm.createTransport({
    service: "gmail",
    auth:{
        user: gmail.email,
        pass: gmail.pw
    }
});

exports.sendConfirmation = function(unverified, req, cb){
    console.log("Unverified email: " + unverified.userEmail + " & id: " + unverified._id);
    console.log("Request hostname: " + req.hostname);
    var link = "http://"+req.hostname+":"+ config.port +"/verify?email="+unverified.userEmail+"&id="+unverified._id;
    console.log(link);
    var mailOptions ={
        from: '"Do Not Reply" <ruokasoftaoppari@gmail.com>',
        to: unverified.userEmail,
        subject: 'Please confirm your account',
        html: "Hello, <br> please use the link below to verify your email.<br>"+link
    }

    console.log("Sending email...");
    smtp.sendMail(mailOptions, (err, info) => {
        if(err){
            return console.log(err);
        }else{
            console.log("Email sent:  " + info.response);
            return cb();
        }
    });
}



