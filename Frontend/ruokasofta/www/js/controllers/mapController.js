app.controller('mapController', function($scope, $log, $http, $timeout, places, address, $q, $timeout) {
 
    var address = address.getAddress();
    $scope.list = false;
    $scope.close = false;
    $scope.restaurants = [];
    var mapCheck = false;
    var markers = [];
    var markers2 = [];
    var helsinki = {lat: 60.1699, lng: 24.9384};

    $scope.showDialog = function() {
      if ($scope.dialog) {
        $scope.dialog.show();
      } else {
        ons.createDialog('dialog.html', { parentScope: $scope })
          .then(function(dialog) {
            $scope.dialog = dialog;
            $scope.dialog.show();
          }.bind($scope));
      }
    }.bind($scope);
    
    $(document).one('pageinit',function(event){
        
            if(event.target.id=="mappage"){

                $timeout(function () {
                    google.maps.event.trigger(map, "resize");
                }, 200);
                
                var infowindow = new google.maps.InfoWindow();
                var map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 14,
                    center: helsinki,
                    type: 'restaurant'
                });

                var service = new google.maps.places.PlacesService(map);
                service.nearbySearch({
                    location: helsinki,
                    radius: 5000,
                    type: ['restaurant']
                }, callback);
            
                $scope.getRestaurants = function(){
                    places.getList().then(function(places){
                        angular.forEach(places, function(place){
                            if(place.placeID){
                                service.getDetails({placeId: place.placeID}, callback);
                            }
                            function callback(result, status) {
                                if (status == google.maps.places.PlacesServiceStatus.OK) {
                                    $scope.restaurants.push(result);
                                    console.log(result);
                                    var marker = new google.maps.Marker({
                                            map: null,
                                            position: result.geometry.location
                                        });
                                        markers2.push(marker);
                                }
                            }
                        });
                    });
                   
                }

                $scope.getRestaurants();
                $scope.$watch('close', function(newValue){
                    if(!newValue){
                        clearMarkers(1);
                    }
                    if(newValue){
                        showMarkers(1);
                    }
                })
                $scope.$watch('list', function(newValue){
                    if(!newValue){
                        clearMarkers(2);
                    }
                    if(newValue){
                        showMarkers(2);
                    }
                })


               function callback(results, status) {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                    for (var i = 0; i < results.length; i++) {
                        createMarker(results[i]);
                    }
                    }
                }
                function createMarker(place) {
                    var placeLoc = place.geometry.location;
                    var marker = new google.maps.Marker({
                        map: null,
                        position: place.geometry.location
                    });
                    markers.push(marker);

                    google.maps.event.addListener(marker, 'click', function() {
                        infowindow.setContent(place.name);
                        infowindow.open(map, this);
                    });
                }
                function setMapClose(map, x) {
                    console.log(map + x)
                    if(x==1){
                        changeMarkers(map, markers);
                    }
                    else if(x==2){
                        changeMarkers(map, markers2);
                    }
                }
                function changeMarkers(map, ms){
                    angular.forEach(ms, function(s){
                        s.setMap(map);
                    })
                }
                function clearMarkers(x) {
                    setMapClose(null, x);
                }
                function showMarkers(x) {
                    setMapClose(map, x);
                }
                var options = {
                    types: ['establishment']
                };

                var input = document.getElementById('mapinput');
                var autocomplete = new google.maps.places.Autocomplete(input, options);
                autocomplete.addListener('place_changed', function() {
                    var place = autocomplete.getPlace();
                    places.addToList(place);
                    $scope.restaurants.push(place);
                     var marker = new google.maps.Marker({
                        map: map,
                        position: place.geometry.location
                    });
                    markers2.push(marker);
                    map.setCenter(marker.getPosition());  

                });

            }
    });
    
    
});