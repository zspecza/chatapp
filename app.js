
// Require dependencies
var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);

// assuming io is the Socket.IO server object
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

// Listen for connections
io.sockets.on('connection', function(socket) {
  
  socket.on('join', function(name) {
    console.log("Someone is connecting...");
    socket.set('nickname', name);
    console.log(name+" has connected!");
    socket.broadcast.emit('connected', name + ' has connected!');
    socket.emit('connected', name + ' has connected!');
  });

  // Receive messages from the client and broadcast them to everyone
  socket.on('messages', function(data) {
    data = data.replace(/\n/g, '<br>');
    socket.get('nickname', function(err, name) {
      socket.broadcast.emit("messages", name + ": " + data);
      socket.emit("messages", name + ": " + data);
    });
  });

  socket.on('disconnect', function() {
    socket.get('nickname', function(err, name) {
      socket.broadcast.emit('disconnected', name + ' has left!');
      socket.emit('disconnected', name + ' has left!');
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