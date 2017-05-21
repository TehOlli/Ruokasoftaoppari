app.directive('groupImage', function() {
  return {
    restrict: 'E',
    controller: function ($scope, address) {
        $scope.id=localStorage.groupid;
        $scope.address=address.getAddress();
    },
    template: '<div style="width:40px; height:40px; border-radius: 50%; background: url({{address}}uploads/groups/{{id}}.jpg); margin-top:10px; background-size:cover;"></div>'
  };
});