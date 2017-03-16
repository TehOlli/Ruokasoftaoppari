module.controller('loginController', ['$scope', '$log', '$http', function($scope, $log, $http) {
       $scope.userName = "";
       $scope.inputFunction = function(user){
            if(user == ""){
                ons.notification.alert("Enter a username");

            }
            else{
                 $http({
                    method: 'POST',
                    url: 'http://localhost:8080/login'
                }).then(function (success){
                    $log.info(success);
                },function (error){
                    $log.info(error)
                });

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