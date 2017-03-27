//CONTROLLER FOR HANDLING SIGNUP
app.controller('signupController', ['$scope', '$log', '$http', function($scope, $log, $http) {

       $scope.userName = "";
       $scope.email = "";
       $scope.emailVal = /^(([^<>()[\]\\.,;:\s@\']+(\.[^<>()[\]\\.,;:\s@\']+)*)|(\'.+\'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zåäöA-ZÅÄÖ\-0-9]+\.)+[a-zåäöA-ZÅÄÖ]{2,}))$/;
       $scope.nameVal = /^[a-zåäö0-9]+$/i;
       
       document.addEventListener('init', function (e) { 

            if (e.target.id == 'signup') {

                 if(localStorage.token != null){

                      $http.get('http://localhost:8080/auth/').then(function (success){

                        $log.info("token check success");

                        myNavigator.pushPage("list.html", {animation : 'none'})

                      },function (error){
                        
                        localStorage.removeItem("token");

                        $log.info("token check error")

                      });
                     
                }

            }
            });

       $scope.signupFunction = function(){

            if($scope.userName==""||$scope.email==""){

                ons.notification.alert("Fill in the information");

            }

            else if(!$scope.signupForm.signupInput.$valid){
                ons.notification.alert("Enter a proper email address");
                
            }

            else if(!$scope.signupForm.signupInput2.$valid){
                ons.notification.alert("Username can only contain letters and numbers");
            }

            else{
                var data = JSON.stringify({username:$scope.userName, email:$scope.email});
                $log.info(data);

                 $http.post('http://localhost:8080/signup', data).then(function (success){
                    
                    if(success.data.success==false){
                        ons.notification.alert(success.data.message);
                    }
                    else{
                        localStorage.token = success.data.token;
                        localStorage.email = $scope.email;
                        $log.info("signup success");

                        myNavigator.pushPage("list.html", {})
                    }

                },function (error){
                    $log.info("signup error", error)
                });

            }
       }

}]);

//CONTROLLER FOR HANDLING GROUP LIST
app.controller('listController', ['$scope', '$log', '$http', function($scope, $log, $http) {

     $http.get('http://localhost:8080/auth/groups').then(function (success){

                $scope.groups = success;

                $log.info($scope.groups.data);

                $log.info("group get success");

            },function (error){
            
                $log.info(error)

            });
    $scope.saveId= function(id){
        localStorage.id = id;
       }
    $scope.removeToken = function(){
        $log.info("token removed")
        localStorage.removeItem("token");
        localStorage.removeItem("email");
       }
       

}]);

//CONTROLLER FOR HANDLING CREATE A GROUP
app.controller('createController', ['$scope', '$log', '$http', function($scope, $log, $http) {

    $scope.groupName = "";
    $scope.groupDesc = "";

    $scope.createFunction = function(){

        if($scope.groupName==""||$scope.groupDesc==""){

            ons.notification.alert("Fill in the information");

        }
        else {
            
            var data = JSON.stringify({groupname:$scope.groupName, description:$scope.groupDesc, email:localStorage.email});

            $log.info(data);

            $http.post('http://localhost:8080/auth/creategroup', data).then(function (success){

                $log.info("success");

                myNavigator.pushPage("list.html", {})

            },function (error){

                $log.info("error", error)

            });
        }
    }
      

}]);

//CONTROLLER FOR HANDLING ADDING/VIEWING MEMEBERS
app.controller('dialogController', ['$scope', '$log', '$http', function($scope, $log, $http) {

    $scope.userEmail = "";

    var id = {id: localStorage.id}

    $http.get('http://localhost:8080/auth/members', {headers: id}).then(function (success){
                
                $scope.users = success;

                $log.info(success.data);

            },function (error){
            
                $log.info(error)

    });

    $scope.adduserFunction = function(){

        $log.info($scope.userEmail);

        if($scope.userEmail==""){


        }
        else {
            
            var data = JSON.stringify({email:$scope.userEmail, id:localStorage.id});

            $log.info(data);

            $http.post('http://localhost:8080/auth/invitetogroup', data).then(function (success){

                $log.info("add success");

                $http.get('http://localhost:8080/auth/members', {headers: id}).then(function (success){
                
                $scope.users = success;

                $log.info(success.data);

            },function (error){
            
                $log.info(error)

                });
                

            },function (error){

                $log.info("add error", error)
                dialog.hide();

            });
        }
    }
      

}]);