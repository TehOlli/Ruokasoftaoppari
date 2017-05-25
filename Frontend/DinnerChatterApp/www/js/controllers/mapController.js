app.controller('mapController', function($scope, $http, $timeout, places, address, $q, $timeout, geolocation, socket) {
 
    var address = address.getAddress();
    $scope.list = true;
    $scope.close = false;
    $scope.restaurants = [];
    var mapCheck = false;
    var markers = [];
    var markers2 = [];
    var userLocation = geolocation.returnPosition();
    var socket = socket.getConnection();

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

    $scope.showDialog2 = function(place, check) {
      $scope.newPlace = check;
      $scope.dialogPlace=place;
      $scope.$apply();
      console.log(place);
      if ($scope.dialog2) {
        $scope.dialog2.show();
      } else {
        ons.createDialog('viewone.html', { parentScope: $scope })
          .then(function(dialog) {
            $scope.dialog2 = dialog;
            $scope.dialog2.show();
          }.bind($scope));
      }
    }.bind($scope);

    $scope.deletePlace = function(x){
        var data = {groupid:localStorage.groupid, placeid:x};
        console.log(data);
        $http.post(address + 'auth/deleteplace', data).then(function(success){
            console.log("place delete success");

        }, function(error){
            console.log("place delete error");

        });
    }
    $(document).one('pageinit',function(event){
        
            if(event.target.id=="mappage"){

                $timeout(function () {
                    google.maps.event.trigger(map, "resize");
                }, 200);
                
                var infowindow = new google.maps.InfoWindow();
                var map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 14,
                    center: userLocation,
                    disableDefaultUI: true
                });
                var marker = new google.maps.Marker({
                    map: map,
                    position: userLocation,
                    animation: google.maps.Animation.DROP,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        fillOpacity: 1,
                        fillColor: 'white',
                        strokeOpacity: 1.0,
                        strokeColor: '#154187',
                        strokeWeight: 7.0, 
                        scale: 7 //pixels
                    }
                });

                var service = new google.maps.places.PlacesService(map);
                service.nearbySearch({
                    location: userLocation,
                    radius: 5000,
                    type: ['restaurant']
                }, callback);

                var image = {
                    url: 'https://maps.gstatic.com/mapfiles/place_api/icons/restaurant-71.png',
                    size: new google.maps.Size(25, 25),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(25, 25),
                };
                function listMarker(placeid){
                    if(placeid){
                        service.getDetails({placeId: placeid}, callback);
                    }
                    function callback(result, status) {
                        if (status == google.maps.places.PlacesServiceStatus.OK) {
                            $scope.restaurants.push(result);
                            $scope.$apply();
                            console.log(result);
                            var resicon;
                            if(!result.photos){
                                resicon="https://maps.gstatic.com/mapfiles/place_api/icons/restaurant-71.png";
                            }
                            else{
                                resicon=result.photos[0].getUrl({'maxWidth': 34, 'maxHeight': 34});
                            }
                            var marker = new google.maps.Marker({
                                    id:result.place_id,
                                    map: map,
                                    position: result.geometry.location,
                                    shape:{coords:[17,17,18],type:'circle'},
                                    icon:{url:resicon,
                                    size:new google.maps.Size(40,40)},
                                    optimized:false
                                });
                                markers2.push(marker);
                        }
                        google.maps.event.addListener(marker, 'click', function() {
                            var check = false;
                                $scope.showDialog2(result, check);
                        });
                    }

                }
                $scope.getRestaurants = function(){
                    $scope.restaurants = [];
                    places.getList().then(function(places){
                        angular.forEach(places, function(place){
                           listMarker(place.placeID);
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
                        position: place.geometry.location,
                        icon:image
                    });
                    markers.push(marker);

                    google.maps.event.addListener(marker, 'click', function() {
                        var check = true;
                        $scope.showDialog2(place, check);
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
                var controls = document.getElementById('mapcontrols');

                map.controls[google.maps.ControlPosition.TOP_CENTER].push(controls);

                var input = document.getElementById('mapinput');

                var autocomplete = new google.maps.places.Autocomplete(input, options);

                autocomplete.addListener('place_changed', function() {
                    var place = autocomplete.getPlace();
                        if (!place.geometry) {
                            ons.notification.alert("That is not a place :(")
                            return;
                        }

                        places.addToList(place.place_id).then(function(){
                            $scope.restaurants.push(place);
                            var resicon;
                            if(!place.photos){
                                resicon="https://maps.gstatic.com/mapfiles/place_api/icons/restaurant-71.png";
                            }
                            else{
                                resicon=place.photos[0].getUrl({'maxWidth': 34, 'maxHeight': 34});
                            }
                            var marker = new google.maps.Marker({
                                id:place.place_id,
                                map: map,
                                position: place.geometry.location,
                                shape:{coords:[17,17,18],type:'circle'},
                                icon:{
                                    url:resicon,
                                    size:new google.maps.Size(40,40)},
                                    optimized:false
                            });
                            markers2.push(marker);
                            google.maps.event.addListener(marker, 'click', function() {
                                var check = true;
                                $scope.showDialog2(place, check);
                            });
                            map.setCenter(marker.getPosition());  
                        }, function(){

                        })
                        $scope.mapinput = "";

                    
                });
                $scope.addNearby = function(x){
                    places.addToList(x).then(function(success){
                        listMarker(x);
                        $scope.newPlace=false;
                    }, function(error){

                    })
                }
                socket.on('placeremoved', function(id){
                    console.log($scope.restaurants);
                    for (var i = 0; i < $scope.restaurants.length; i++) {
                        if($scope.restaurants[i].place_id==id){
                            $scope.restaurants.splice(i,1);
                        }
                        
                    }
                     for (var i = 0; i < markers2.length; i++) {
                         console.log(markers2)
                        if(markers2[i].id==id){
                            markers2[i].setMap(null);
                            markers2.splice(i,1);
                            console.log("marker removed")
                        }
                        
                    }
                });
                socket.on('placeadded', function(data){
                    console.log(data);
                    if(data.user!=localStorage.userid){
                        listMarker(data.place);
                    }
                })


            }
    });
    
    
});