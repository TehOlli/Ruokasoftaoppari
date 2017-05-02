app.service('address', function($http){
    var local = "http://localhost:8080/";
    var proto = "http://193.167.99.102:80/";
    this.getAddress = function(){
        return local;
    }
});