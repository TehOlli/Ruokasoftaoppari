//CONTROLLER FOR HANDLING CHAT
app.controller('groupController', function($scope, $log, $http, address, socket) {
    $scope.groupName = localStorage.groupname;
    var socket = socket.getConnection();
    socket.emit('room', localStorage.groupid);
    socket.on("removedFromGroup", function(){
        myNavigator.resetToPage("list.html", {animation : 'slide'});
    })


});
