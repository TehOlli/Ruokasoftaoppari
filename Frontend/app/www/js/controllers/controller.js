module.controller('loginController', ['$scope', '$log', '$http', function($scope, $log, $http) {
       $scope.userName = "";
       $scope.inputFunction = function(user){
            if(user == ""){
                ons.notification.alert("Enter a username");

            }
            else{

                $http.post('localhost:8080/login', $scope.userName).success(function (data){
                    $log.info(data);
                }).error(function (err){
                    $log.info("error")
                })

                $log.info(user);
                 myNavigator
                .pushPage("list.html", {
    
                })
            }
       }

}]);

module.controller('listController', ['$scope', '$log', function($scope, $log) {
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

module.controller('createController', ['$scope', '$log', function($scope, $log) {
      

}]);