//CONTROLLER FOR HANDLING CHAT
app.controller('groupController', function($scope, $log, $http, address, socket) {
    $scope.groupName = localStorage.groupname;
    var socket = socket.getConnection();
    socket.on('connect', function() {
        socket.emit('room', localStorage.groupid);
    });

});
