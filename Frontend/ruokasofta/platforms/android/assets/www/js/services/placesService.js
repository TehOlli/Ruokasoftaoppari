app.service('places', function($http){
    var placesList = [];
    var local = "http://localhost:8080/";
    var proto = "http://proto453.haaga-helia.fi:80/";
    this.addToList = function(place){
        var data = {placeid:place.place_id, groupid:localStorage.id};
        console.log(data);
        $http.post(local + 'auth/saveplace', data).then(function(success){
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
        $http.get(local + 'auth/getplaces', {headers:header}).then(function(success){
            console.log("places get success");
        }, function(error){
            console.log("places get error", error);
        });
        return placesList;
    }

});