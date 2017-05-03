app.controller('mapController', ['$scope', '$log', '$http', '$timeout', 'places', 'address', function($scope, $log, $http, $timeout, places, address) {
 
    var address = address.getAddress();
    $scope.list = true;
    $scope.close = false;
    

    document.addEventListener('init', function (e) { 

            if (e.target.id == 'mappage') {

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
                var markers = [];
                var markers2 = [];
                var helsinki = {lat: 60.1699, lng: 24.9384};
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
                    if(x==1){
                        y=markers;
                    }
                    else if(x==2){
                        var place = places.getList();
                        for(var i = 0; i < place.length; i++){
                            console.log(place[i]);
                            var marker = new google.maps.Marker({
                                map: null,
                                position: place[i].geometry.location
                            });
                            markers2.push(marker);
                        }
                        y=markers2;
                    }
                    for (var i = 0; i < y.length; i++) {
                    y[i].setMap(map);
                    }
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

                // var input = document.getElementById('mapinput');
                // var autocomplete = new google.maps.places.Autocomplete(input, options);
                // map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
                // autocomplete.addListener('place_changed', function() {
                //     var place = autocomplete.getPlace();
                //      var marker = new google.maps.Marker({
                //         map: map,
                //         position: place.geometry.location
                //     });
                //     markers2.push(marker);
                //     map.setCenter(marker.getPosition());  

                // });


            }
        });
    
    
}]);