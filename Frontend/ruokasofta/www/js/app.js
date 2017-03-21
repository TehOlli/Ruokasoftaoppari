var app = ons.bootstrap('my-app', ['onsen']);

function testInterceptor() {
  return {
    request: function(config) {
        if(localStorage.token != null){
        config.headers['Authorization'] = 'Bearer ' + localStorage.token;
        console.log(config.headers);
        }
      return config;
    },

    requestError: function(config) {
      return config;
    },

    response: function(res) {
      return res;
    },

    responseError: function(res) {
      return res;
    }
  }
}

app.factory('testInterceptor', testInterceptor)
.config(function($httpProvider) {
  $httpProvider.interceptors.push('testInterceptor');
})