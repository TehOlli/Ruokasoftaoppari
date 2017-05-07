app.service('socket', function($http, address, $q){
    var address = address.getAddress();
    var socket = "";
    this.connectUser = function(){
        socket = io.connect(address);
        console.log("user connected")
    }
    
    this.getConnection = function(){
        return socket;
    }

    this.disconnectUser = function(){
        socket.disconnect();
        console.log("disconnected")
    }

});