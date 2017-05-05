//CONTROLLER FOR HANDLING GROUP
app.controller('manageController', ['$scope', '$log', '$http', 'validation','address', function($scope, $log, $http, validation,address) {
    $scope.admin = false;
    $scope.userEmail = "";
    $scope.groupName = "";
    $scope.groupDesc = "";
    $scope.name = true;
    $scope.desc = true;
    var address = address.getAddress();

    getMembers();
    var header = {groupid: localStorage.groupid}

    $http.get(address + 'auth/getgroup', {headers:header}).then(function(success){
        console.log("group info get success");
        $scope.groupName = success.data.groupName;
        $scope.groupDesc = success.data.groupDesc;
        var time = Date.now();
        document.getElementById("group-img").style.background = "url(" + address + "uploads/groups/" + localStorage.id + ".jpg" + "?" + time + ")";
        document.getElementById("group-img").style.backgroundSize = "cover";

    }, function(error){
        console.log("group info get error");
    });

    if(localStorage.email==localStorage.admin){
        $scope.admin=true;
    }

   function getMembers(){
       var id = {groupid: localStorage.groupid}
       $http.get(address + 'auth/members', {headers: id}).then(function(success){
        $scope.users = success

       },function(error){

       });
   }

   $scope.alterName = function(){
       var data = {id: localStorage.groupid, name:$scope.groupName};
       $scope.alterGroup(data);
       $scope.name = true;
   }

   $scope.alterDesc = function(){
       var data = {id: localStorage.groupid, desc:$scope.groupDesc};
       $scope.alterGroup(data);
       $scope.desc = true;
   }

   $scope.alterGroup = function(x){
       $http.post(address + 'auth/altergroup', x).then(function(success){
           console.log("group alter success");

       },function(error){
           console.log("group alter error");

       });
   }

   $scope.uploadFile = function(files){
        var form = new FormData();
        form.append("groupimg", files[0]);
        $scope.form = form;
        
        var header = {headers:{'content-type':undefined, 'groupid':localStorage.groupid}}

            $http.post(address + 'auth/setgroupimage', $scope.form, header).then(function(success){
                console.log("group file send success");
                var time = Date.now();
                document.getElementById("group-img").style.background = "url(" + address + "uploads/groups/" + localStorage.id + ".jpg" + "?" + time + ")";
                document.getElementById("group-img").style.backgroundSize = "cover";
            },function(error){
                console.log("file send error", error)
            })
            $scope.form = "";
    }

    $scope.adduserFunction = function(){

        var val = validation.adduserVal($scope.userEmail);

        if(val==true){

            var data = JSON.stringify({email:$scope.userEmail, id:localStorage.groupid, name:localStorage.groupname});

            $log.info(data);

            $http.post(address + 'auth/invitetogroup', data).then(function (success){

                  if(success.data.success==false){

                    ons.notification.alert(success.data.message);

                  }
                  else{
                       $log.info(success);

                       $scope.userEmail = "";

                       ons.notification.alert("Invite has been sent");
                  }

            },function (error){

                $log.info("add error", error)
                dialog.hide();

            });
        }

    }
    $scope.removeUser = function(email){

        var id = {groupid: localStorage.groupid}
        var data = JSON.stringify({email: email, groupid:localStorage.groupid});
        console.log(data);

         $http.post(address + 'auth/removefromgroup', data).then(function (success){

              if(success.data.success==false){

                    ons.notification.alert(success.data.message);

                  }
                  else{
                       $log.info("user remove success");

                       getMembers();

                  }

            },function (error){

                $log.info("user remove error", error)

            });

    }
    $scope.leaveGroup = function(){

         var data = JSON.stringify({email: localStorage.email, groupid:localStorage.groupid});

        $http.post(address + 'auth/removefromgroup', data).then(function (success){

                $log.info("user remove success");

                myNavigator.resetToPage("list.html")

         },function (error){

                $log.info("user remove error", error)

            });


    }

    $scope.deleteGroup = function(){

         var data = JSON.stringify({groupid:localStorage.groupid});

         function confDelete(){

             $http.post(address + 'auth/deletegroup', data).then(function (success){

                $log.info("delete group success");
                    ons.notification.alert({
                            message: "Group has been deleted",
                            callback: function(){
                                myNavigator.resetToPage("list.html")
                            }
                        })


            },function (error){

                $log.info("delete group", error)

            });
        
             
         }
        ons.notification.confirm({
            message: "Are you sure?",
            callback: function(x){
                switch(x){
                    case 0:
                        break;
                    case 1:
                        confDelete();
                        break;
                }
            }
        })


    }
      

}]);