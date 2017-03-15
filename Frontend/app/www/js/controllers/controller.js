module.controller('loginController', ['$scope', '$log', function($scope, $log) {
       $scope.userName = "";
       $scope.inputFunction = function(user){
            if(user == ""){
                ons.notification.alert("Enter a username");

            }
            else{
                $log.info(user);
                 myNavigator
                .pushPage("list.html", {
    
                })
            }
       }

}]);
module.controller('listController', ['$scope', '$log', function($scope, $log) {
      

}]);