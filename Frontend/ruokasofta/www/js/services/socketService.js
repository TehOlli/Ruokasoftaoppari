app.service('socket', function(address){
    var address = address.getAddress();
    var socket = "";
    this.connectUser = function(){
        socket = io.connect(address, {
            query: {token: localStorage.token}
        });
        socket.emit("storeUser", localStorage.userid);

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

