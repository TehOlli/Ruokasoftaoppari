app.service('places', function($http, address, $q){
    var address = address.getAddress();
    this.addToList = function(place){
        var deferred = $q.defer();
        var data = {placeid:place, groupid:localStorage.groupid};
        $http.post(address + 'auth/saveplace', data).then(function(success){
            if(success.data.success==false){
                deferred.reject();
            }
            else{
                deferred.resolve();
                console.log("place add success");
            }

        }, function(error){
            console.log("place add error", error)
            deferred.reject();
        });
        return deferred.promise;
    }
    
    this.getList = function(){
        var deferred = $q.defer();
        var header = {groupid: localStorage.groupid}
        $http.get(address + 'auth/getplaces', {headers:header}).then(function(success){
            console.log("places get success");
            console.log(success);
            deferred.resolve(success.data.places);
        }, function(error){
            console.log("places get error", error);
            deferred.reject(error);
        });

        return deferred.promise;
    }

});