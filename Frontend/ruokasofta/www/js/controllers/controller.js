//CONTROLLER FOR HANDLING SIGNUP
app.controller('signupController', ['$scope', '$log', '$http','validation', function($scope, $log, $http, validation) {

       $scope.userName = "";
       $scope.userEmail = "";
       $scope.userPassword = "";
       var local = "http://localhost:8080/";
       var proto = "http://proto453.haaga-helia.fi:80/";
       
       document.addEventListener('init', function (e) { 

            if (e.target.id == 'signup') {

                 if(localStorage.token != null){

                      $http.get(local + 'auth').then(function (success){

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

            var val = validation.signupVal($scope.userEmail, $scope.userName, $scope.userPassword);

            if(val==true){

                 var data = JSON.stringify({username:$scope.userName, email:$scope.userEmail, password:$scope.userPassword});
                $log.info(data);

                 $http.post(local + 'signup', data).then(function (success){
                    
                    if(success.data.success==false){
                        ons.notification.alert(success.data.message);
                    }
                    else{
                        localStorage.token = success.data.token;
                        localStorage.email = $scope.userEmail;
                        $log.info("signup success");

                        myNavigator.pushPage("list.html", {})
                    }

                },function (error){
                    $log.info("signup error", error)
                });

            }

       }

}]);

//CONTROLLER FOR HANDLING LOGIN
app.controller('loginController', ['$scope', '$log', '$http', 'validation', function($scope, $log, $http, validation) {

    $scope.userEmail = "";
    $scope.userPassword = "";
    var local = "http://localhost:8080/";
    var proto = "http://proto453.haaga-helia.fi:80/";

    $scope.loginFunction = function(){

        var data = JSON.stringify({email:$scope.userEmail, password:$scope.userPassword});

        $http.post(local + 'login', data).then(function (success){

                 if(success.data.success==false){
                    ons.notification.alert(success.data.message);
                 }
                 else{
                    localStorage.token = success.data.token;
                    localStorage.email = $scope.userEmail;
                    $log.info("login success");

                    myNavigator.pushPage("list.html", {})
                    }

            },function (error){

                $log.info("login error", error)

            });

    } 

}]);
//CONTROLLER FOR HANDLING GROUP LIST
app.controller('listController', ['$scope', '$log', '$http', function($scope, $log, $http) {

    var local = "http://localhost:8080/";
    var proto = "http://proto453.haaga-helia.fi:80/";

     $http.get(local + 'auth/groups').then(function (success){

                $scope.groups = success;

                $log.info($scope.groups.data);

                $log.info("group get success");

            },function (error){
            
                $log.info(error)

            });

    $scope.saveId= function(group){

        localStorage.id = group._id;
        localStorage.admin = group.groupAdmin;
        

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
    var local = "http://localhost:8080/";
    var proto = "http://proto453.haaga-helia.fi:80/";

    $scope.createFunction = function(){

        if($scope.groupName==""||$scope.groupDesc==""){

            ons.notification.alert("Fill in the information");

        }
        else {
            
            var data = JSON.stringify({groupname:$scope.groupName, description:$scope.groupDesc, email:localStorage.email});

            $log.info(data);

            $http.post(local + 'auth/creategroup', data).then(function (success){

                $log.info("success");

                myNavigator.pushPage("list.html", {})

            },function (error){

                $log.info("error", error)

            });
        }
    }
      

}]);

app.controller('groupController', ['$scope', '$log', '$http', '$anchorScroll', function($scope, $log, $http, $anchorScroll) {
    $scope.chatInput = "";
    $scope.messages = [];
    var socket = io.connect('http://localhost:8080/');
    socket.on('connect', function() {
    socket.emit('room', localStorage.id);
    });
    $scope.sendmesFunction = function(){
        console.log("1")
        socket.emit('message', $scope.chatInput);
        $scope.chatInput = "";
        console.log("2")
    }
    socket.on('message', function(msg){
        $scope.messages.push(msg);
        $scope.$apply();
        console.log($scope.messages)
    })

   
      

}]);

//CONTROLLER FOR HANDLING ADDING/VIEWING MEMEBERS
app.controller('manageController', ['$scope', '$log', '$http', 'validation','membersService', function($scope, $log, $http, validation, membersService) {
    $scope.admin = false;
    $scope.userEmail = "";
    var local = "http://localhost:8080/";
    var proto = "http://proto453.haaga-helia.fi:80/";

    if(localStorage.email==localStorage.admin){
        $scope.admin=true;
    }

    var id = {id: localStorage.id}

   membersService.async().then(function(d) {
      $scope.users = d;
    });

    $scope.adduserFunction = function(){

        var val = validation.adduserVal($scope.userEmail);

        if(val==true){

            var data = JSON.stringify({email:$scope.userEmail, id:localStorage.id});

            $log.info(data);

            $http.post(local + 'auth/invitetogroup', data).then(function (success){

                  if(success.data.success==false){

                    ons.notification.alert(success.data.message);

                  }
                  else{
                       $log.info("add success");

                       $scope.userEmail = "";

                      membersService.async().then(function(d) {
                        $scope.users = d;
                      });

                  }

            },function (error){

                $log.info("add error", error)
                dialog.hide();

            });
        }

    }
    $scope.removeUser = function(email){

        var id = {id: localStorage.id}
        var data = JSON.stringify({email: email, groupid:localStorage.id});
        console.log(data);

         $http.post(local + 'auth/removefromgroup', data).then(function (success){

              if(success.data.success==false){

                    ons.notification.alert(success.data.message);

                  }
                  else{
                       $log.info("user remove success");

                       membersService.async().then(function(d) {
                            $scope.users = d;
                        });

                  }

            },function (error){

                $log.info("user remove error", error)

            });

    }
    $scope.leaveGroup = function(){

         var data = JSON.stringify({email: localStorage.email, groupid:localStorage.id});

        $http.post(local + 'auth/removefromgroup', data).then(function (success){

                $log.info("user remove success");

                myNavigator.pushPage("list.html", {})

         },function (error){

                $log.info("user remove error", error)

            });


    }

    $scope.deleteGroup = function(){

         var data = JSON.stringify({groupid:localStorage.id});

        $http.post(local + 'auth/deletegroup', data).then(function (success){

                $log.info("delete group success");

                myNavigator.pushPage("list.html", {})

         },function (error){

                $log.info("delete group", error)

            });


    }
      

}]);