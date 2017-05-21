app.directive('resRating', function() {
  return {
    restrict: 'E',
    scope: {
        rating: '@'
    },
    controller: function ($scope, $sce) {
        $scope.x = "";
        var stars = (Math.round($scope.rating * 2) / 2).toFixed(1);
        for(i = 0; i < 5 ; i++){
            if(stars>=1){
                $scope.x=$scope.x + '<ons-icon icon="ion-android-star"></ons-icon>';
                stars=stars-1;
            }
            else if(stars==0.5){
                $scope.x=$scope.x + '<ons-icon icon="ion-android-star-half"></ons-icon>';
                stars=stars-0.5;
            }
            else if(stars==0){
                $scope.x=$scope.x + '<ons-icon icon="ion-android-star-outline"></ons-icon>';
            }
        }
        $scope.x = $sce.trustAsHtml($scope.x);
    },
    template: '<span ng-bind-html="x"></span>'
  };
});