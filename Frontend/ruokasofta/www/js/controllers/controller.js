app.controller('signupController', ['$scope', '$log', '$http', function($scope, $log, $http) {

       $scope.userName = "";
       $scope.email = "";
       $scope.emailVal = /^(([^<>()[\]\\.,;:\s@\']+(\.[^<>()[\]\\.,;:\s@\']+)*)|(\'.+\'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zåäöA-ZÅÄÖ\-0-9]+\.)+[a-zåäöA-ZÅÄÖ]{2,}))$/;
       $scope.nameVal = /^[a-zåäö0-9]+$/i;
       
       document.addEventListener('init', function (e) { 
            if (e.target.id == 'signup') { 
                 if(localStorage.token != null){

                     var token = localStorage.token;

                     $http({
                        url: 'http://localhost:8080/auth/users', 
                        method: "GET",
                        Authorization: token
                    }).then(function (success){

                    $log.info("token check success");

                },function (error){

                    $log.info("token check error")
                });
                    myNavigator
                    .pushPage("list.html", {animation : 'none'})
                }

            }
            });

       $scope.inputFunction = function(){

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
                    $log.info(success.data.token);
                    $log.info("success");

                    myNavigator
                    .pushPage("list.html", {})

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

app.controller('createController', ['$scope', '$log', function($scope, $log) {
      

}]);