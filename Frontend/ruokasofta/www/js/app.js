var app = angular.module('my-app', ['onsen','luegg.directives','ngSanitize']);

app.factory('myHttpInterceptor', function($q, $rootScope) {
  var check=false;
  return {
    'request': function(config) {
       if(localStorage.token != null){
        config.headers['Authorization'] = 'Bearer ' + localStorage.token;
        config.headers['userid'] = localStorage.userid;
        console.log(config.headers);
        }
      return config;
    },

   'responseError': function(rejection) {
       if(rejection.status == 401&&check==false){
        console.log("forbidden");
        check=true;
        localStorage.removeItem("token");
        localStorage.removeItem("userid");
        ons.notification.alert({
            message: "Authentication error",
            callback: function(){
                myNavigator.resetToPage("signup.html");
                check=false;
            }
        })
      }
      return $q.reject(rejection);
    },

    'response':function(response) {
      if(response.data.success==false){
        ons.notification.alert(response.data.message)
      }
      return response;
    }
  };
});

app.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('myHttpInterceptor');    
}]);

app.run(function($rootScope) {
})
