app.controller('signupController', ['$scope', '$log', '$http', function($scope, $log, $http) {
       $scope.userName = "";
       $scope.email = ""
       $scope.inputFunction = function(){
            if($scope.userName==""||$scope.email==""){
                ons.notification.alert("Fill in the information");

            }
            else{
                var data = JSON.stringify({username:$scope.userName, email:$scope.email});

                 $http.post('http://localhost:8080/signup', data).then(function (success){
                    $log.info("success", success);
                },function (error){
                    $log.info("error", error)
                });

                $log.info(data);
                 myNavigator
                .pushPage("list.html", {
    
                })
            }
       }

}]);

app.controller('listController', ['$scope', '$log', function($scope, $log) {
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