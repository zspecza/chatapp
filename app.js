
// Require dependencies
var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var redis = require('redis');
var client = redis.createClient();

// assuming io is the Socket.IO server object
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

var storeMessage = function(name, data) {
  var message = JSON.stringify({name: name, data: data});
  redisClient.lpush("messages", message, function(err, response) {
    redisClient.ltrim("messages", 0, 10);
  });
};

// Listen for connections
io.sockets.on('connection', function(socket) {
  
  socket.on('join', function(name) {
    redisClient.lrange("messages", 0, -1, function(err, messages){
      messages = messages.reverse();
      messages.forEach(function(message) {
        message = JSON.parse(message);
        socket.emit("messages", '<div id="messagecontainer"><div class="username">' + message.name + ': </div><div class="usermessage">' + message.data + '</div></div>');
      });
    });
    console.log("Someone is connecting...");
    socket.set('nickname', name);
    console.log(name+" has connected!");
    socket.emit("connected", name + " joined the chat");
  });

  // Receive messages from the client and broadcast them to everyone
  socket.on('messages', function(data) {
    data = data.replace(/\n/g, '<br />');
    socket.get('nickname', function(err, name) {
      storeMessage(name, data);
      socket.emit("messages", '<div id="messagecontainer"><div class="username">' + name + ': </div><div class="usermessage">' + data + '</div></div>');
    });
  });

});

// Without this line, the CSS will not work
app.use('/public', express.static(__dirname + '/public'));

// Route index.html to the root path
app.get('/', function(request, response) {
	response.sendfile(__dirname + "/index.html");
});

// Listen for GET requests to the server
var port = process.env.PORT || 5000;
server.listen(port, function() {
  console.log("Listening on port " + port);
});