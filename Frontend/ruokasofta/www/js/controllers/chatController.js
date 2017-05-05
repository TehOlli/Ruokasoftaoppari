//CONTROLLER FOR HANDLING CHAT
app.controller('chatController', ['$scope', '$log', '$http', '$anchorScroll', 'address', function($scope, $log, $http, $anchorScroll, address) {
    $scope.chatInput = "";
    $scope.messages = [];
    $scope.msgdate = "01.01.1970";
    $scope.date = false;
    var address = address.getAddress();
    var id = {id: localStorage.id};

    $http.get(address + 'auth/getmessages', {headers: id}).then(function (success){

                $log.info(success.data);
                for(var x in success.data){
                    $scope.messages.push(success.data[x]);
                }
                
            },function (error){
            
                $log.info(error)

            });

    var socket = io.connect(address);
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