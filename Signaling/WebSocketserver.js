// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
"use strict";

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-chat';

// Port where we'll run the websocket server
var webSocketsServerPort = 1337;

// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');

/**
 * Global variables
 */
// latest 100 messages
var history = [];
// list of currently connected clients (users)
var clients = [];

var connections = {};
var connectionIDCounter = 0;

/**
 * HTTP server
 */
var server = http.createServer(function(request, response) {
    // Not important for us. We're writing WebSocket server, not HTTP server
});
server.listen(webSocketsServerPort, function() {
    console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});

/**
 * WebSocket server
 */
var wsServer = new webSocketServer({
    // WebSocket server is tied to a HTTP server. WebSocket request is just
    // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
    httpServer: server
});

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function(request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');
    var connection = request.accept(null, request.origin);
    // Store a reference to the connection using an incrementing ID
    connection.id = connectionIDCounter++;
    connections[connection.id] = connection;
    // we need to know client index to remove them on 'close' event
    var index = clients.push(connection) - 1;
    var userName = false;
    var userColor = false;

    console.log((new Date()) + ' Connection accepted.');

    // send back chat history
    if (history.length > 0) {
        connection.sendUTF(JSON.stringify({
            type: 'history',
            data: history
        }));
    }

    function sendToOther() {
        var othersClient = [];
        for (var i = 0; i < clients.length; i++) {
            if (clients[i] !== connection) {
                othersClient.push(clients[i]);
            }
        }
        return othersClient;
    }
    // user sent some message
    connection.on('message', function(message) {
        var jsonMessage = {};
        try {
            jsonMessage = JSON.parse(message.utf8Data);
            //console.log("message", jsonMessage);
        } catch (e) {

        }
        if (message.type === 'utf8') { // accept only text
            //console.log(jsonMessage.username);
            userName = jsonMessage.username;
            var type = jsonMessage.hasOwnProperty("0") && jsonMessage[0];
            var details = jsonMessage.hasOwnProperty("1") && jsonMessage[1];
            if (type) {
               // console.log(type);
                switch (type) {
                    case 'connection':
                    var json = JSON.stringify(['connect',connection.id]);
                    return connection.send(json);
                        break;
                    case 'message':
                        if (!details) return;

                        var otherClient = sendToOther();
                        if (!otherClient) return;

                        details.from = connection.id;
                        for (var i = 0; i < otherClient.length; i++) {
                            //clients[i].sendUTF(json);
                            otherClient[i].send(JSON.stringify(["message",details]));
                        }
                        break;
                    case 'shareScreen':
                        //console.log("shareScreen");
                        break;
                    case 'unshareScreen':
                        //console.log("unshareScreen");
                        break;
                    case 'join':
                        var clientids = [];
                        for (var i = 0; i < clients.length; i++) {
                            if (clients[i] !== connection) {
                                clientids.push({
                                    id: clients[i].id
                                })
                                //console.log(clients[i].id)
                            }
                        }
                        var detail= {name:details,from:connection.id,clients:clientids};
                        connection.send(JSON.stringify(["join",detail]));
                        break;
                    case 'disconnect':
                        //console.log("disconnect");
                        break;
                    case 'leave':
                        //console.log("leave");
                        break;
                    case 'create':
                        //console.log("create");
                        break;
                    case 'trace':
                        //console.log("trace");
                        break;
                    case 'stunservers':
                        //console.log("stunservers");
                        break;
                    case 'turnservers':
                        //console.log("turnservers");
                        break;
                }
            }
        }
    });
    // user disconnected
    connection.on('close', function() {
            var otherClient = sendToOther();
            if (!otherClient) return;

            var details= {id:connection.id};
             
            for(var i = 0; i < otherClient.length; i++) {
                //clients[i].sendUTF(json);
                otherClient[i].send(JSON.stringify(["remove", details]));
            }
            var index=clients.indexOf(connection);
            clients.splice(index, 1);
            delete connections[connection.id];
    });
});