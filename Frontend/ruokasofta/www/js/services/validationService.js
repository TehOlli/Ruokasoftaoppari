app.service('validation', function() {
    var reg = /^(([^<>()[\]\\.,;:\s@\']+(\.[^<>()[\]\\.,;:\s@\']+)*)|(\'.+\'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zåäöA-ZÅÄÖ\-0-9]+\.)+[a-zåäöA-ZÅÄÖ]{2,}))$/;
    var reg2 = /^[a-zåäö0-9]+$/i;
    var reg3 = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/

    this.signupVal = function (email, name, pass) {
        var val = true;

        if(email==""||name ==""||pass ==""){
            val = false;
            ons.notification.alert("Fill in the information");
        }
        else if(!reg.test(email)){
            val = false;
            ons.notification.alert("Enter a proper email address");
        }
        else if(!reg2.test(name)){
            val = false;
            ons.notification.alert("Username can only contain letters and numbers");
        }
        else if(!reg3.test(pass)){
            val = false;
            ons.notification.alert("Password must contain at least 6 characters, 1 number and 1 alphabet");
        }
        return val;
        
    }
    
    this.adduserVal = function (email) {
        var val = true;

         if(email==""){
            val = false;
            ons.notification.alert("Fill in the information");
        }
        else if(!reg.test(email)){
            val = false;
            ons.notification.alert("Enter a proper email address");
        }
        return val;
        
    }
});