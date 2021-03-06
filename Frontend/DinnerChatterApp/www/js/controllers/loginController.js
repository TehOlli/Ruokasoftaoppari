//CONTROLLER HANDLING LOGIN
app.controller('loginController', function($scope, $log, $http, validation, address, socket) {

    $scope.loginEmail = "";
    $scope.loginPassword = "";
    var address = address.getAddress();

    $scope.loginFunction = function(){

        var data = {email:$scope.loginEmail, password:$scope.loginPassword};

        console.log(data)

        $http.post(address + 'login', data).then(function (success){

            if(success.data.success==false){
            ons.notification.alert(success.data.message);
            }
            else{
            localStorage.token = success.data.token;
            localStorage.userid = success.data.userid;
            localStorage.name = success.data.username;
            socket.connectUser();
            $log.info("login success", success);
            myNavigator.pushPage("list.html", {})
            }

        },function (error){

            $log.info("login error", error)

        });

       }

      
});