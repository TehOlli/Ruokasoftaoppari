var app = angular.module('my-app', ['onsen','luegg.directives']);

app.factory('myHttpInterceptor', function($q, $rootScope) {
  var check=false;
  return {
    'request': function(config) {
       if(localStorage.token != null){
        config.headers['Authorization'] = 'Bearer ' + localStorage.token + "asd";
        config.headers['Email'] = localStorage.email;
        console.log(config.headers);
        }
      return config;
    },

   'responseError': function(rejection) {
       if(rejection.status == 403&&check==false){
        console.log("forbiden");
        check=true;
        ons.notification.alert({
            message: "Authentication error",
            callback: function(){
                myNavigator.resetToPage("signup.html");
                check=false;
            }
        })
      }
      return $q.reject(rejection);
    }
  };
});

app.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('myHttpInterceptor');    
}]);
