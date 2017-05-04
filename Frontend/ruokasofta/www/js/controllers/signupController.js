//CONTROLLER FOR HANDLING SIGNUP
app.controller('signupController', ['$scope', '$log', '$http','validation', 'address', function($scope, $log, $http, validation, address) {

       $scope.userName = "";
       $scope.userEmail = "";
       $scope.userPassword = "";
       $scope.loginEmail = "";
       $scope.loginPassword = "";
       var address = address.getAddress();
       
       document.addEventListener('init', function (e) { 

            if (e.target.id == 'signup') {

                 if(localStorage.token != null){

                      $http.get(address + 'auth').then(function (success, status){

                        $log.info("ctrl 19 token check success");

                        myNavigator.pushPage("list.html", {animation : 'none'})

                      },function (error){
                        
                        localStorage.removeItem("token");

                        $log.info("token check error")

                      });
                     
                }

            }
            });

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
                        localStorage.token = success.data.token;
                        localStorage.email = $scope.userEmail;
                        localStorage.name = $scope.userName;
                        $log.info("signup success");

                        myNavigator.pushPage("list.html", {})
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
                            localStorage.email = obj.email;
                            console.log("google auth success");
                            myNavigator.pushPage("list.html", {})
                        }

                    }, function(error){
                        console.log("google auth error");

                    });

                }
                
            }
       }

}]);
