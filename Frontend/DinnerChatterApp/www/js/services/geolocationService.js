app.service('geolocation', function($q){
    var userLocation = {lat: 60.1699, lng: 24.9384};

    this.getPosition = function(){ 
        document.addEventListener("deviceready", onDeviceReady, false);
        function onDeviceReady() {
            var deferred = $q.defer();
            var onSuccess = function(position){
                userLocation = {lat: position.coords.latitude, lng: position.coords.longitude};
                deferred.resolve({lat: position.coords.latitude, lng: position.coords.longitude});
            }
            var onError = function(error){
                deferred.reject(error);
            }
            navigator.geolocation.getCurrentPosition(onSuccess, onError);

            return deferred.promise;
        }
    }

    this.returnPosition = function(){
        return userLocation;
    }
});

