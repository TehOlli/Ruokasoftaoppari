app.service('places', function($http, address, $q){
    var placesList = [];
    var address = address.getAddress();
    this.addToList = function(place){
        var data = {placeid:place.place_id, groupid:localStorage.groupid};
        console.log(data);
        $http.post(address + 'auth/saveplace', data).then(function(success){
            console.log("place add success");

        }, function(error){
            console.log("place add error", error)
        });
        placesList.push(place);
        console.log(placesList);
        return true;
    }
    
    this.getList = function(){
        var deferred = $q.defer();
        var header = {groupid: localStorage.groupid}
        $http.get(address + 'auth/getplaces', {headers:header}).then(function(success){
            console.log("places get success");
            deferred.resolve(success.data.places);
        }, function(error){
            console.log("places get error", error);
            deferred.reject(error);
        });

        return deferred.promise;
    }

});