var io = require('socket.io-client');

function SocketIoConnection(config) {
    var self=this;
    this.funcList={};
   // this.connection = io.connect(config.url, config.socketio);
    this.socket = new WebSocket(config.signal_url);
    this.socket.onopen = function (msg) {
        this.send(JSON.stringify(["connection"]));
    };
    /*this.socket.onmessage=function(details){
        var detail=JSON.parse(details.data);
        if(detail[0]==="connect"){
            self.connection.scid=detail[1];
        }
        else
        {
            self.on(detail[0], self.funcList[detail[0]]);
        }
    }*/
    this.send=send;
    function send(msg) {
        if (this.socket && this.socket.readyState == this.socket.OPEN) {
            trace("Send a message:" + msg)
            this.socket.send(msg);
        } else {
            console.log('Failed to send');
        }
    }

}

SocketIoConnection.prototype.on = function (ev, fn) {
  /*  console.log(ev,'on io.trap');
    var self=this;
    self.connection.on(ev, fn);//want to invoke that on this.socket.onmessage
    this.funcList[ev]=fn;*/
   /* self.socket.onmessage=function(details){
        
        function (ev, fn,detail) {
            
        }
    }*/
};

SocketIoConnection.prototype.emit = function () {
  //  console.log(arguments);
   // this.connection.emit.apply(this.connection, arguments);
    //this.socket.send(JSON.stringify(arguments));
};

SocketIoConnection.prototype.getSessionid = function () {
    return this.socket.peerid;
};

SocketIoConnection.prototype.disconnect = function () {
    return this.connection.disconnect();
};

module.exports = SocketIoConnection;