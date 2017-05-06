//CONTROLLER FOR HANDLING CHAT
app.controller('groupController', ['$scope', '$log', '$http', 'address', function($scope, $log, $http, address) {
    $scope.groupName = localStorage.groupname;

}]);
