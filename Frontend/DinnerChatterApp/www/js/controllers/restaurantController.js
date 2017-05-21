app.controller('restaurantController', function($scope, $log, $http, places, address) {
    var address = address.getAddress();
    $scope.restaurants = [];

    document.addEventListener('init', function (e) { 

        if (e.target.id == 'restaurant') {
            var options = {
                types: ['establishment']
            };

            var input = document.getElementById('mapinput');
            var autocomplete = new google.maps.places.Autocomplete(input, options);
            autocomplete.addListener('place_changed', function() {
                var place = autocomplete.getPlace();
                    console.log(place);
                    places.addToList(place);
                    $scope.restaurants.push(place);
                    $scope.$apply();
                });
        }
     });
});