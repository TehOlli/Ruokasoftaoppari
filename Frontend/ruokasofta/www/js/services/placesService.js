app.service('places', function($http, address){
    var placesList = [];
    var address = address.getAddress();
    this.addToList = function(place){
        var data = {placeid:place.place_id, groupid:localStorage.id};
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
        var header = {id: localStorage.id}
        $http.get(address + 'auth/getplaces', {headers:header}).then(function(success){
            console.log("places get success");
        }, function(error){
            console.log("places get error", error);
        });
        return placesList;
    }

});