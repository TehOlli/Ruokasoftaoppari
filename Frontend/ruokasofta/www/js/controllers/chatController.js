//CONTROLLER FOR HANDLING CHAT
app.controller('chatController', function($scope, $log, $http, $anchorScroll, address, socket) {
    $scope.chatInput = "";
    $scope.messages = [];
    $scope.msgdate = "01.01.1970";
    $scope.date = false;
    var address = address.getAddress();
    var id = {groupid: localStorage.groupid};
    var socket = socket.getConnection();

    $http.get(address + 'auth/getmessages', {headers: id}).then(function (success){
            for(var x in success.data){
                $scope.messages.push(success.data[x]);
            }
                
            },function (error){
            
                $log.info(error)

            });

    socket.on('connect', function() {
        socket.emit('room', localStorage.groupid);
    });
    $scope.sendmesFunction = function(){
        if(!$scope.chatInput==""){
            var t = new Date();
            var time = ('0' + t.getHours()).slice(-2) + "." + ('0' + t.getMinutes()).slice(-2);
            var date = ('0' + t.getDate()).slice(-2) + "." + ('0' + (t.getMonth()+1)).slice(-2) + "." + t.getFullYear(); 
            console.log(time, date);
            $scope.messages.push({username: localStorage.name, msg: $scope.chatInput, own:true, time:time, date:date});
            socket.emit('message', {room: localStorage.groupid, msg:$scope.chatInput, username:localStorage.name, userid:localStorage.userid, time:time, date:date});
            $scope.chatInput = "";

        }
    }
    socket.on('message', function(msg){
        $scope.messages.push(msg);
        $scope.$apply();
        console.log(msg)
    })

   
      

});
