app.directive('logOut', function() {
  return {
    restrict: 'E',
    controller: function ($scope, socket) {

        $scope.logoutFunction = function(){
            ons.notification.confirm({
                message: 'Logout?',
                callback: function(x){
                    switch(x){
                        case 0:
                            break;
                        case 1:
                            document.addEventListener('deviceready', deviceReady, false);
                            function deviceReady() {
                                window.plugins.googleplus.logout(
                                    function (msg) {
                                    console.log("google logout success")
                                    }
                                );
                            }
                            localStorage.clear();
                            socket.disconnectUser();
                            myNavigator.resetToPage("signup.html")
                            break;
                    }
                }   
            })
        }
    },
    template: '<ons-icon style="margin-left:15px;" ng-click="logoutFunction()" class="list-icon" icon="ion-android-exit"></ons-icon>'
  };
});