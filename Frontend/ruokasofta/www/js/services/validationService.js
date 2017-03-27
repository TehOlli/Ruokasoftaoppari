app.service('validation', function() {
    var reg = /^(([^<>()[\]\\.,;:\s@\']+(\.[^<>()[\]\\.,;:\s@\']+)*)|(\'.+\'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zåäöA-ZÅÄÖ\-0-9]+\.)+[a-zåäöA-ZÅÄÖ]{2,}))$/;
    var reg2 = /^[a-zåäö0-9]+$/i;

    this.signupVal = function (email, name) {
        var val = true;

        if(email==""||name ==""){
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