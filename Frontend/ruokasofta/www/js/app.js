var app = ons.bootstrap('my-app', ['onsen']);

function Interceptor() {
  return {
    request: function(config) {
        if(localStorage.token != null){
        config.headers['Authorization'] = 'Bearer ' + localStorage.token;
        config.headers['Email'] = localStorage.email;
        console.log(config.headers);
        }
      return config;
    }
  }
}

app.factory('Interceptor', Interceptor)
.config(function($httpProvider) {
  $httpProvider.interceptors.push('Interceptor');
})