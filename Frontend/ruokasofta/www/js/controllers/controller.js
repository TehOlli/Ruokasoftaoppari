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

                    localStorage.token = success.data.token;
                    localStorage.email = $scope.email;
                    $log.info(success.data.token);
                    $log.info("success");

                    myNavigator.pushPage("list.html", {})

                },function (error){
                    $log.info("error", error)
                });

            }
       }

}]);

app.controller('listController', ['$scope', '$log', function($scope, $log) {
    
    $scope.removeToken = function(){
        $log.info("token removed")
        localStorage.removeItem("token");
       }

      $scope.groups = [
          {
              name: 'Topis group',
              description: 'Description for this group'

          },
          {
              name: 'Ollis group',
              description: 'Description for this group'

          },
          {
              name: 'Juhas group',
              description: 'Description for this group'

          }
      ];
      $log.info($scope.groups[0]);

}]);

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

            },function (error){

                $log.info("error", error)

            });
        }
    }
      

}]);