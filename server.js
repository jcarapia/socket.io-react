var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var httpProxy = require('http-proxy');
var publicPath = path.resolve(__dirname, 'public');
var mongoose = require('mongoose');
var port = process.env.PORT || 3000;
var User = require('./db/models/usermodel');

// We need to add a configuration to our proxy server,
// as we are now proxying outside localhost
var proxy = httpProxy.createProxyServer({
  changeOrigin: true
});
// connection for production
mongoose.connect('mongodb://museum:museum12345@ds043027.mlab.com:43027/vrmuseum');


// // connection local
// mongoose.connect('mongo://localhost/users');

//serving our index.html
app.use(express.static(publicPath));


//server/compiler.js runs webpack-dev-server which creates the bundle.js which index.html serves
//the compiler adds some console logs for some extra sugar
//notice that you will not see a physical bundle.js because webpack-dev-server runs it from memory
var bundle = require('./server/compiler.js')
bundle()

app.get('/', function(req, res){
	res.render('index.html');
})

io.on('connection', function (socket) {
	socket.emit('news', { hello: 'World io' });

	socket.on('my other event', function (data) {
  console.log(data);
	});
});

// io.on('ready', function(socket){
// 	socket.io.join(socket.data.chat_room);
// 	socket.io.join(socket.data.signal_room);
// 	io.room(socket.data).broadcast('announce', {
// 		message: 'New client in the ' + socket.data + 'room.'
// 	});
// });

// io.on('send', function(socket){
// 	io.room(socket.data.room).broadcast('message', {
// 		message: socket.data.message,
// 		author: socket.data.author
// 	})
// });

// io.on('signal', function(socket){
// 	// note the user of req here for broadcasting so only the sender doesn't receive ther own messages. We are using req instead of app
// 	socket.io.room(socket.data.room).broadcast('signaling_message', {
// 		type: socket.data.type,
// 		message: socket.data.message
// 	})
// });
//express now processes all requests to localhost:8080
//app.all is a special routing method used for loading middleware functions
app.all('/build/*', function (req, res) {
  proxy.web(req, res, {
      target: 'http://localhost:8080'
  })
})

proxy.on('error', function(e) {
  console.log('Could not connect to proxy, please try again...')
});

server.listen(port, function () {
  console.log('Server running on port ' + port)
});



