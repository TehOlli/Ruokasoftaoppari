//CONTROLLER FOR HANDLING SIGNUP
app.controller('signupController', function($scope, $log, $http, validation, address, socket) {

       $scope.userName = "";
       $scope.userEmail = "";
       $scope.userPassword = "";
       var address = address.getAddress();
       
       document.addEventListener('init', function (e) { 

            if (e.target.id == 'signup') {

                 if(localStorage.token != null){

                      $http.get(address + 'auth').then(function (success, status){

                        $log.info("token check success");
                        socket.connectUser();
                        console.log(socket);
                        myNavigator.pushPage("list.html", {animation : 'none'})

                      },function (error){
                        
                        localStorage.removeItem("token");

                        $log.info("token check error")

                      });
                     
                }

            }
            });

       $scope.tryloginFunction = function(){
           var data = {email:$scope.userEmail, password:$scope.userPassword};
           $http.post(address + "login", data).then(function(success){
               localStorage.token = success.data.token;
               localStorage.userid = success.data.userid;
               localStorage.name = $scope.userName;
               console.log("login success");
               myNavigator.pushPage("list.html", {})

           }, function(error){
               console.log("login error");

           });
       }

       $scope.signupFunction = function(){

            var val = validation.signupVal($scope.userEmail, $scope.userName, $scope.userPassword);

            if(val==true){

                 var data = JSON.stringify({username:$scope.userName, email:$scope.userEmail, password:$scope.userPassword});
                $log.info(data);

                 $http.post(address + 'signup', data).then(function (success){
                    
                    if(success.data.success==false){
                        ons.notification.alert(success.data.message);
                    }
                    else{
                        ons.notification.confirm({
                            message: success.data.message + " Tap ok after verifying it.",
                            callback: function(x){
                                switch(x){
                                    case 0:
                                        break;
                                    case 1:
                                        $scope.tryloginFunction();
                                        break;
                                }
                            }    
                        });
                    }

                },function (error){
                    $log.info("signup error", error)
                });

            }

       }

       $scope.googleloginFunction = function(){

           document.addEventListener('deviceready', deviceReady, false);

            function deviceReady() {
                console.log('device is ready');
                window.plugins.googleplus.login(
                    {
                        'scopes': '',
                        'webClientId': '546073062554-fvurgo1ps4fhrn4plhkno8l26b07894s.apps.googleusercontent.com',
                        'offline': true
                    
                    },
                    function (obj) {
                        console.log(obj);
                        authUser(obj);
                    },
                    function (msg) {
                        alert('error: ' + msg);
                    }
                );

                function authUser(obj){
                    data = {token: obj.idToken};
                    $http.post(address + 'googleauth', data).then(function(success){
                        if(success.data.success==false){
                            ons.notification.alert(success.data.message);
                        }
                        else{
                            localStorage.token = success.data.token;
                            localStorage.userid = success.data.userid;
                            console.log("google auth success");
                            socket.connectUser();
                            myNavigator.pushPage("list.html", {})
                        }

                    }, function(error){
                        console.log("google auth error");

                    });

                }
                
            }
       }

});
