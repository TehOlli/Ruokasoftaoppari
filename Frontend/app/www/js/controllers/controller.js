module.controller('loginController', ['$scope', '$log', function($scope, $log) {
       $scope.userName = "";
       $scope.inputFunction = function(user){
            $log.info(user);
            if(user !== ""){
                myNavigator
                .pushPage("list.html", {
    
                })

            }
       }

}]);
module.controller('listController', ['$scope', '$log', function($scope, $log) {
      

}]);