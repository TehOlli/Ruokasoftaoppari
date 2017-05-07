//CONTROLLER FOR HANDLING GROUP LIST
app.controller('listController', function($scope, $log, $http, address, socket) {
    $scope.invites = [];
    var address = address.getAddress();
    $scope.imgurl = address;
    groupsFunction();
    invitesFunction();

    function invitesFunction(){
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
        var data = {id:group.groupID};
        console.log(data);
        $http.post(address +  'auth/acceptinv', data).then(function(success){
            console.log(success);
            invitesFunction();
            groupsFunction();

        },function (error){

            console.log(error);
        });
    }

    $scope.declineInvite = function(group){
        var data = {id:group.groupID};
        console.log(data);
        $http.post(address +  'auth/declineinv', data).then(function(success){
            console.log(success);
            invitesFunction();

        },function (error){

            console.log(error);
        })

    }


    $scope.saveId= function(group){
        localStorage.groupid = group._id;
        localStorage.admin = group.groupAdmin;
        localStorage.groupname = group.groupName;
        

       }

    $scope.removeToken = function(){
        $log.info("token removed")
        socket.disconnectUser();
        localStorage.removeItem("token");
        localStorage.removeItem("userid");
       }
       

});