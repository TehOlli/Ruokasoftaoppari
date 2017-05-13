app.controller('tryloginController', function($scope, $http, address, socket, $timeout) {
    var address = address.getAddress();
    $timeout(function () {
        if(localStorage.token != null){

        $http.get(address + 'auth').then(function (success, status){
            console.log("token check success");
            socket.connectUser();
            console.log(socket);
            myNavigator.pushPage("list.html", {animation : 'fade'})

        },function (error){  
            localStorage.removeItem("token");
            myNavigator.pushPage("signup.html", {animation : 'fade'})
            console.log("token check error")

        });
            
        }
        else{
            myNavigator.pushPage("signup.html", {animation : 'fade'})
        }
    }, 2000);

      
});