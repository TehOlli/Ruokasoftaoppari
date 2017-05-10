//CONRTOLLER FOR HANDLING USER INFORMATION
app.controller('settingsController', function($scope, $log, $http, validation, $q, address, image) {
    
    $scope.username = "";
    $scope.email = "";
    $scope.oldpass = "";
    $scope.newpass = "";
    $scope.form = "";
    var usernamecheck = "";
    var address = address.getAddress();

    $http.get(address + 'auth/profile').then(function(success){
        $scope.username = success.data.username;
        usernamecheck = success.data.username;
        $scope.email = success.data.userEmail;
        image.getImage("profile-img", localStorage.userid, "avatars/");

    },function(error){
        console.log(error);

    });

    $scope.uploadFile = function(files){
        $scope.form = image.tempImage("profile-img", files, "avatar");
    }

    $scope.saveProfile = function(){

        function imgUpload(){
            var deferred = $q.defer();
            if($scope.form!=""){
                var header = {headers:{'content-type':undefined}}

                $http.post(address + 'auth/setavatar', $scope.form, header).then(function(success){
                    console.log("user file send success");
                },function(error){
                    console.log("file send error", error)
                })
                $scope.form = "";

                deferred.resolve("sent");
            }
            else{

                deferred.resolve("sent");
            }

            return deferred.promise;
            
        }

        function nameChange(){
            var deferred = $q.defer();
            var val = validation.changenameVal($scope.username, usernamecheck);
            if(val==true){
                var data=JSON.stringify({username:$scope.username, userid:localStorage.userid});

                console.log(data);

                $http.post(address + 'auth/changeusername', data).then(function (success){
                    console.log("username change success");
                    usernamecheck=$scope.username;

                },function (error){
                    console.log(error);
                })
                deferred.resolve("changed");
            }
            else {
                deferred.resolve("changed");
            }
            
            return deferred.promise;
        }

        function passChange(){
            var deferred = $q.defer();
            var val = validation.changepassVal($scope.oldpass, $scope.newpass);
            if(val==true){
                var data = JSON.stringify({oldpassword: $scope.oldpass, newpassword: $scope.newpass, userid:localStorage.userid});
                console.log(data);

                $http.post(address + 'auth/changepassword', data).then(function(success){
                    console.log("password change success")
                    $scope.newpass="";
                    $scope.oldpass="";
                },function(error){
                    console.log("password change error", error)
                })
                deferred.resolve("changed");
            }
            else{
                deferred.resolve("changed");
            }
            return deferred.promise;
        }

        imgUpload().then(function(x){
            nameChange().then(function(x){
                passChange().then(function(x){
                     ons.notification.alert({
                        message: "Changes have been saved",
                        callback: function(){
                            myNavigator.popPage();
                        }
                    })
                });
            });
        });        
    }

});