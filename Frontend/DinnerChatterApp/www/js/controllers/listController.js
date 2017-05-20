//CONTROLLER FOR HANDLING GROUP LIST
app.controller('listController', function($scope, $log, $http, address, socket, geolocation, file) {
    $scope.invites = [];
    var address = address.getAddress();
    $scope.imgurl = address;
    groupsFunction();
    geolocation.getPosition();

    $scope.invitesFunction = function(){
        $http.get(address + 'auth/invites').then(function(success){
            console.log("invite get success");
            $scope.invites = success.data.invites;
            if($scope.invites.length){
                document.getElementById('invite-icon').style.color = "red";
            }
            else{
                document.getElementById('invite-icon').style.color = "white";
            }

        },function (error){
            console.log("invite get error");

        });
    }
    $scope.invitesFunction();
    function groupsFunction(){
        $http.get(address + 'auth/groups').then(function (success){
            $scope.groups = success;
            $log.info(success);
            $log.info("group get success");

        },function (error){
            $log.info(error)

        });
    }

    $scope.acceptInvite = function(group){
        var data = {groupid:group.groupID, userid:localStorage.userid};
        console.log(data);
        $http.post(address +  'auth/acceptinv', data).then(function(success){
            console.log(success);
            $scope.invitesFunction();
            groupsFunction();

        },function (error){

            console.log(error);
        });
    }

    $scope.declineInvite = function(group){
        var data = {groupid:group.groupID, userid:localStorage.userid};
        console.log(data);
        $http.post(address +  'auth/declineinv', data).then(function(success){
            console.log(success);
            $scope.invitesFunction();

        },function (error){

            console.log(error);
        })

    }


    $scope.saveId= function(group){
        localStorage.groupid = group._id;
        localStorage.admin = group.groupAdmin;
        localStorage.groupname = group.groupName;   

       }

});