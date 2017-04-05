app.factory('membersService', function($http) {
  var local = "http://localhost:8080/";
  var proto = "http://proto453.haaga-helia.fi:80/";
  var id = {id: localStorage.id}
  
  return {
    async: function() {
        return $http.get(local + 'auth/members', {headers: id});
        }
  };
});
