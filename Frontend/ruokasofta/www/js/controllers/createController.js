//CONTROLLER FOR HANDLING CREATE A GROUP
app.controller('createController', function($scope, $log, $http, validation, address, image) {

    $scope.groupName = "";
    $scope.groupDesc = "";
    $scope.form = "";
    var address = address.getAddress();

    $scope.uploadFile = function(files){
       $scope.form = image.tempImage("create-group-img", files, "groupimg");
    }

    $scope.createFunction = function(){

        var val = validation.groupVal($scope.groupName, $scope.groupDesc);
        if(val==true){

            var data = JSON.stringify({groupname:$scope.groupName, description:$scope.groupDesc, userid:localStorage.userid});

            $log.info(data);

            $http.post(address + 'auth/creategroup', data).then(function (success){

                if(success.data.success){
                    $log.info("group create success");
                    console.log(success)
                    if($scope.form!=""){
                        var header = {headers:{'content-type':undefined, 'groupid':success.data.group._id}}
                        $http.post(address + 'auth/setgroupimage', $scope.form, header).then(function(success){
                            console.log("create file send success");
                            ons.notification.alert({
                                message: "Group has been created",
                                callback: function(){
                                    myNavigator.resetToPage("list.html", {animation : 'slide'})
                                }

                            })
                        },function(error){
                            console.log("file send error", error)
                        })
                        $scope.form = "";
                    }
                    else{
                        ons.notification.alert({
                            message: "Group has been created",
                            callback: function(){
                                myNavigator.resetToPage("list.html" , {animation : 'slide'})
                            }
                        })
                    }

                }
            },function (error){
                $log.info("error", error)

            });
        }    
    }    
});