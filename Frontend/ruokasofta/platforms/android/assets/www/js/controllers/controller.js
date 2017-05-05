//CONTROLLER FOR HANDLING SIGNUP
app.controller('signupController', ['$scope', '$log', '$http','validation', function($scope, $log, $http, validation) {

       $scope.userName = "";
       $scope.userEmail = "";
       $scope.userPassword = "";
       var local = "http://localhost:8080/";
       var proto = "http://proto453.haaga-helia.fi:80/";
       
       document.addEventListener('init', function (e) { 

            if (e.target.id == 'signup') {

                 if(localStorage.token != null){

                      $http.get(local + 'auth').then(function (success){

                        $log.info("token check success");

                        myNavigator.pushPage("list.html", {animation : 'none'})

                      },function (error){
                        
                        localStorage.removeItem("token");

                        $log.info("token check error")

                      });
                     
                }

            }
            });

       $scope.signupFunction = function(){

            var val = validation.signupVal($scope.userEmail, $scope.userName, $scope.userPassword);

            if(val==true){

                 var data = JSON.stringify({username:$scope.userName, email:$scope.userEmail, password:$scope.userPassword});
                $log.info(data);

                 $http.post(local + 'signup', data).then(function (success){
                    
                    if(success.data.success==false){
                        ons.notification.alert(success.data.message);
                    }
                    else{
                        localStorage.token = success.data.token;
                        localStorage.email = $scope.userEmail;
                        localStorage.name = $scope.userName;
                        $log.info("signup success");

                        myNavigator.pushPage("list.html", {})
                    }

                },function (error){
                    $log.info("signup error", error)
                });

            }

       }
       $scope.googleloginFunction = function(){

           document.addEventListener('deviceready', deviceReady, false);

            function deviceReady() {
                console.log('device is ready');
                window.plugins.googleplus.login(
                    {
                    
                    },
                    function (obj) {
                    alert(JSON.stringify(obj)); // do something useful instead of alerting
                    },
                    function (msg) {
                    alert('error: ' + msg);
                    }
                );
                
            }
       }

}]);

//CONTROLLER FOR HANDLING LOGIN
app.controller('loginController', ['$scope', '$log', '$http', 'validation', function($scope, $log, $http, validation) {

    $scope.userEmail = "";
    $scope.userPassword = "";
    var local = "http://localhost:8080/";
    var proto = "http://proto453.haaga-helia.fi:80/";

    $scope.loginFunction = function(){

        var data = {email:$scope.userEmail, password:$scope.userPassword};

        $http.post(local + 'login', data).then(function (success){

                 if(success.data.success==false){
                    ons.notification.alert(success.data.message);
                 }
                 else{
                    localStorage.token = success.data.token;
                    localStorage.email = $scope.userEmail;
                    localStorage.name = success.data.username;
                    $log.info("login success", success);

                    myNavigator.pushPage("list.html", {})
                    }

            },function (error){

                $log.info("login error", error)

            });

    } 

}]);
//CONTROLLER FOR HANDLING GROUP LIST
app.controller('listController', ['$scope', '$log', '$http', function($scope, $log, $http) {
    $scope.invites = [];
    var local = "http://localhost:8080/";
    var proto = "http://proto453.haaga-helia.fi:80/";
    $scope.imgurl = "http://localhost:8080/";
    groupsFunction();
    invitesFunction();

    function invitesFunction(){
        $http.get(local + 'auth/invites').then(function(success){
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
        $http.get(local + 'auth/groups').then(function (success){
        $scope.groups = success;
        $log.info($scope.groups.data);
        $log.info("group get success");

        },function (error){
            $log.info(error)

        });
    }

    $scope.acceptInvite = function(group){
        var data = {id:group.groupID};
        console.log(data);
        $http.post(local +  'auth/acceptinv', data).then(function(success){
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
        $http.post(local +  'auth/declineinv', data).then(function(success){
            console.log(success);
            invitesFunction();

        },function (error){

            console.log(error);
        })

    }


    $scope.saveId= function(group){
        localStorage.id = group._id;
        localStorage.admin = group.groupAdmin;
        localStorage.groupname = group.groupName;
        

       }

    $scope.removeToken = function(){
        $log.info("token removed")
        localStorage.removeItem("token");
        localStorage.removeItem("email");
       }
       

}]);

//CONTROLLER FOR HANDLING CREATE A GROUP
app.controller('createController', ['$scope', '$log', '$http','validation', function($scope, $log, $http, validation) {

    $scope.groupName = "";
    $scope.groupDesc = "";
    $scope.form = "";
    var local = "http://localhost:8080/";
    var proto = "http://proto453.haaga-helia.fi:80/";

    $scope.uploadFile = function(files){
        var form = new FormData();
        form.append("groupimg", files[0]);
        $scope.form = form;

        var reader = new FileReader();
        reader.readAsDataURL(files[0]);

        reader.onload = function (e){
            document.getElementById("create-group-img").style.background = "url(" + e.target.result + ")";
            document.getElementById("create-group-img").style.backgroundSize = "cover";
        }
    }

    $scope.createFunction = function(){

        var val = validation.groupVal($scope.groupName, $scope.groupDesc);
        if(val==true){

            var data = JSON.stringify({groupname:$scope.groupName, description:$scope.groupDesc, email:localStorage.email});

            $log.info(data);

            $http.post(local + 'auth/creategroup', data).then(function (success){

                $log.info("group create success");

                if($scope.form!=""){
                    var header = {headers:{'content-type':undefined, 'id':success.data.group._id}}

                    $http.post(local + 'auth/setgroupimage', $scope.form, header).then(function(success){
                        console.log("create file send success");
                        ons.notification.alert({
                            message: "Group has been created",
                            callback: function(){
                                myNavigator.resetToPage("list.html")
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
                            myNavigator.resetToPage("list.html")
                        }
                    })
                }


            },function (error){

                $log.info("error", error)

            });

        }
    
    }
      

}]);

//CONRTOLLER FOR HANDLING USER INFORMATION
app.controller('settingsController', ['$scope', '$log', '$http', 'validation','$q', function($scope, $log, $http, validation, $q) {
    
    $scope.username = "";
    $scope.email = "";
    $scope.oldpass = "";
    $scope.newpass = "";
    $scope.form = "";
    var usernamecheck = "";
    var local = "http://localhost:8080/";
    var proto = "http://proto453.haaga-helia.fi:80/";

    $http.get(local + 'auth/profile').then(function(success){
        $scope.username = success.data.username;
        usernamecheck = success.data.username;
        $scope.email = success.data.userEmail;
        var time = Date.now();
        document.getElementById("profile-img").style.background = "url(" + local + "uploads/avatars/" + $scope.email + ".jpg" + "?" + time + ")";
        document.getElementById("profile-img").style.backgroundSize = "cover";  


    },function(error){
        console.log(error);

    });

    $scope.uploadFile = function(files){
        var form = new FormData();
        form.append("avatar", files[0]);
        $scope.form = form;
        console.log("upload file");
        var reader = new FileReader();
        reader.readAsDataURL(files[0]);

        reader.onload = function (e){
            console.log("reader onload");
            document.getElementById("profile-img").style.background = "url(" + e.target.result + ")";
            document.getElementById("profile-img").style.backgroundSize = "cover";
        }


    }

    $scope.saveProfile = function(){

        function imgUpload(){
            var deffered = $q.defer();
            if($scope.form!=""){
                var header = {headers:{'content-type':undefined}}

                $http.post(local + 'auth/setavatar', $scope.form, header).then(function(success){
                    console.log("user file send success");
                },function(error){
                    console.log("file send error", error)
                })
                $scope.form = "";

                deffered.resolve("sent");
            }
            else{

                deffered.resolve("sent");
            }

            return deffered.promise;
            
        }

        function nameChange(){
            var deffered = $q.defer();
            var val = validation.changenameVal($scope.username, usernamecheck);
            if(val==true){
                var data=JSON.stringify({username:$scope.username, email:$scope.email});

                console.log(data);

                $http.post(local + 'auth/changeusername', data).then(function (success){
                    console.log("username change success");
                    usernamecheck=$scope.username;

                },function (error){
                    console.log(error);
                })
                deffered.resolve("changed");
            }
            else {
                deffered.resolve("changed");
            }
            
            return deffered.promise;
        }

        function passChange(){
            var deffered = $q.defer();
            var val = validation.changepassVal($scope.oldpass, $scope.newpass);
            if(val==true){
                var data = JSON.stringify({oldpassword: $scope.oldpass, newpassword: $scope.newpass, email:$scope.email});
                console.log(data);

                $http.post(local + 'auth/changepassword', data).then(function(success){
                    console.log("password change success")
                    $scope.newpass="";
                    $scope.oldpass="";
                },function(error){
                    console.log("password change error", error)
                })
                deffered.resolve("changed");
            }
            else{
                deffered.resolve("changed");
            }
            return deffered.promise;
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

}]);

//CONTROLLER FOR HANDLING CHAT
app.controller('chatController', ['$scope', '$log', '$http', '$anchorScroll', function($scope, $log, $http, $anchorScroll) {
    $scope.chatInput = "";
    $scope.messages = [];
    $scope.msgdate = "01.01.1970";
    $scope.date = false;
    var local = "http://localhost:8080/";
    var proto = "http://proto453.haaga-helia.fi:80/";
    var id = {id: localStorage.id};

    $http.get(local + 'auth/getmessages', {headers: id}).then(function (success){

                $log.info(success.data);
                for(var x in success.data){
                    $scope.messages.push(success.data[x]);
                }
                
            },function (error){
            
                $log.info(error)

            });

    var socket = io.connect('http://localhost:8080/');
        socket.on('connect', function() {
        socket.emit('room', localStorage.id);
    });
    $scope.sendmesFunction = function(){
        if(!$scope.chatInput==""){
            var t = new Date();
            var time = ('0' + t.getHours()).slice(-2) + "." + ('0' + t.getMinutes()).slice(-2);
            var date = ('0' + t.getDate()).slice(-2) + "." + ('0' + (t.getMonth()+1)).slice(-2) + "." + t.getFullYear(); 
            console.log(time, date);
            $scope.messages.push({username: localStorage.name, msg: $scope.chatInput, own:true, time:time, date:date});
            socket.emit('message', {room: localStorage.id, msg:$scope.chatInput, username:localStorage.name, email:localStorage.email, time:time, date:date});
            $scope.chatInput = "";

        }
    }
    socket.on('message', function(msg){
        $scope.messages.push(msg);
        $scope.$apply();
        console.log(msg)
    })

   
      

}]);

//CONTROLLER FOR HANDLING RESTAURANT LIST
app.controller('restaurantController', ['$scope', '$log', '$http','places', function($scope, $log, $http, places) {
    var local = "http://localhost:8080/";
    var proto = "http://proto453.haaga-helia.fi:80/";
    $scope.restaurants = [];

    document.addEventListener('init', function (e) { 

        if (e.target.id == 'restaurant') {
            var options = {
                types: ['establishment']
            };

            var input = document.getElementById('mapinput');
            var autocomplete = new google.maps.places.Autocomplete(input, options);
            autocomplete.addListener('place_changed', function() {
                var place = autocomplete.getPlace();
                    console.log(place);
                    places.addToList(place);
                    $scope.restaurants.push(place);
                    $scope.$apply();
                });
        }
     });
}]);

//CONTROLLER FOR HANDLING MAP
app.controller('mapController', ['$scope', '$log', '$http', '$timeout', 'places', function($scope, $log, $http, $timeout, places) {
 
    var local = "http://localhost:8080/";
    var proto = "http://proto453.haaga-helia.fi:80/";
    $scope.list = true;
    $scope.close = false;
    

    document.addEventListener('init', function (e) { 

            if (e.target.id == 'mappage') {

                $scope.$watch('close', function(newValue){
                    if(!newValue){
                        clearMarkers(1);
                    }
                    if(newValue){
                        showMarkers(1);
                    }
                })
                $scope.$watch('list', function(newValue){
                    if(!newValue){
                        clearMarkers(2);
                    }
                    if(newValue){
                        showMarkers(2);
                    }
                })
                var markers = [];
                var markers2 = [];
                var helsinki = {lat: 60.1699, lng: 24.9384};
                var infowindow = new google.maps.InfoWindow();

                var map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 14,
                    center: helsinki,
                    type: 'restaurant'
                });

                var service = new google.maps.places.PlacesService(map);
                service.nearbySearch({
                    location: helsinki,
                    radius: 5000,
                    type: ['restaurant']
                }, callback);

                function callback(results, status) {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                    for (var i = 0; i < results.length; i++) {
                        createMarker(results[i]);
                    }
                    }
                }
                 function createMarker(place) {
                    var placeLoc = place.geometry.location;
                    var marker = new google.maps.Marker({
                        map: null,
                        position: place.geometry.location
                    });
                    markers.push(marker);

                    google.maps.event.addListener(marker, 'click', function() {
                        infowindow.setContent(place.name);
                        infowindow.open(map, this);
                    });
                }
                function setMapClose(map, x) {
                    if(x==1){
                        y=markers;
                    }
                    else if(x==2){
                        var place = places.getList();
                        for(var i = 0; i < place.length; i++){
                            console.log(place[i]);
                            var marker = new google.maps.Marker({
                                map: null,
                                position: place[i].geometry.location
                            });
                            markers2.push(marker);
                        }
                        y=markers2;
                    }
                    for (var i = 0; i < y.length; i++) {
                    y[i].setMap(map);
                    }
                }
                 function clearMarkers(x) {
                    setMapClose(null, x);
                }
                function showMarkers(x) {
                    setMapClose(map, x);
                }
                var options = {
                    types: ['establishment']
                };

                // var input = document.getElementById('mapinput');
                // var autocomplete = new google.maps.places.Autocomplete(input, options);
                // map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
                // autocomplete.addListener('place_changed', function() {
                //     var place = autocomplete.getPlace();
                //      var marker = new google.maps.Marker({
                //         map: map,
                //         position: place.geometry.location
                //     });
                //     markers2.push(marker);
                //     map.setCenter(marker.getPosition());  

                // });


            }
        });
    
    
}]);

//CONTROLLER FOR HANDLING GROUP
app.controller('manageController', ['$scope', '$log', '$http', 'validation', function($scope, $log, $http, validation) {
    $scope.admin = false;
    $scope.userEmail = "";
    $scope.groupName = "";
    $scope.groupDesc = "";
    $scope.name = true;
    $scope.desc = true;
    var local = "http://localhost:8080/";
    var proto = "http://proto453.haaga-helia.fi:80/";

    getMembers();
    var header = {id: localStorage.id}

    $http.get(local + 'auth/getgroup', {headers:header}).then(function(success){
        console.log("group info get success");
        $scope.groupName = success.data.groupName;
        $scope.groupDesc = success.data.groupDesc;
        var time = Date.now();
        document.getElementById("group-img").style.background = "url(" + local + "uploads/groups/" + localStorage.id + ".jpg" + "?" + time + ")";
        document.getElementById("group-img").style.backgroundSize = "cover";

    }, function(error){
        console.log("group info get error");
    });

    if(localStorage.email==localStorage.admin){
        $scope.admin=true;
    }

   function getMembers(){
       var id = {id: localStorage.id}
       $http.get(local + 'auth/members', {headers: id}).then(function(success){
        $scope.users = success

       },function(error){

       });
   }

   $scope.alterName = function(){
       var data = {id: localStorage.id, name:$scope.groupName};
       $scope.alterGroup(data);
       $scope.name = true;
   }

   $scope.alterDesc = function(){
       var data = {id: localStorage.id, desc:$scope.groupDesc};
       $scope.alterGroup(data);
       $scope.desc = true;
   }

   $scope.alterGroup = function(x){
       $http.post(local + 'auth/altergroup', x).then(function(success){
           console.log("group alter success");

       },function(error){
           console.log("group alter error");

       });
   }

   $scope.uploadFile = function(files){
        var form = new FormData();
        form.append("groupimg", files[0]);
        $scope.form = form;
        
        var header = {headers:{'content-type':undefined, 'id':localStorage.id}}

            $http.post(local + 'auth/setgroupimage', $scope.form, header).then(function(success){
                console.log("group file send success");
                var time = Date.now();
                document.getElementById("group-img").style.background = "url(" + local + "uploads/groups/" + localStorage.id + ".jpg" + "?" + time + ")";
                document.getElementById("group-img").style.backgroundSize = "cover";
            },function(error){
                console.log("file send error", error)
            })
            $scope.form = "";
    }

    $scope.adduserFunction = function(){

        var val = validation.adduserVal($scope.userEmail);

        if(val==true){

            var data = JSON.stringify({email:$scope.userEmail, id:localStorage.id, name:localStorage.groupname});

            $log.info(data);

            $http.post(local + 'auth/invitetogroup', data).then(function (success){

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

        var id = {id: localStorage.id}
        var data = JSON.stringify({email: email, groupid:localStorage.id});
        console.log(data);

         $http.post(local + 'auth/removefromgroup', data).then(function (success){

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

         var data = JSON.stringify({email: localStorage.email, groupid:localStorage.id});

        $http.post(local + 'auth/removefromgroup', data).then(function (success){

                $log.info("user remove success");

                myNavigator.resetToPage("list.html")

         },function (error){

                $log.info("user remove error", error)

            });


    }

    $scope.deleteGroup = function(){

         var data = JSON.stringify({groupid:localStorage.id});

         function confDelete(){

             $http.post(local + 'auth/deletegroup', data).then(function (success){

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