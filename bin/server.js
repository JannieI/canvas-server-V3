// Imports
var app = require('../app');                    // This is where all the routing happens
var debug = require('debug')('canvas-server:server');
var http = require('http');
const socketio = require('socket.io');          // Socket Server
const debugWs = require('debug')('app:ws');
const config = require('config');               // Configuration

// Get port from environment, else use default
const portFromConfig = +config.get('canvasServerPort');
const port = typeof portFromConfig == 'number'?  portFromConfig  :  8000;

// Create HTTP server
const server = http.createServer(app);

// Socket.io server
const io = socketio(server);

// Connect event fires whenever a client connects to this server on '/' namespace (the default)
// socket is the socket connection with the client.  A socket is the fundamental for interacting
// with browser clients.  It uses underlying Client to communicate.  The socket class inherits
// from the Node.jse EventEmitter

// Names spaces defines different endpoints or paths to group connections together.
// It minimizes TCP connections  (resources), and introduces separate communication
// channels.  io.on creates the default (/) namespace.  Each namespace may optionally have a
// number of rooms, which clients   can join or leave.  io.emit references the default /
// namespace. It is the same as io.of('/').emit   Similarly, socket. works on /
// as io.on = io.of('/').on
// Use const chat = io.of('/chat') to reference the /chat namespace.  And then
// chat.emit('text') to send a message to all connected clients in the namespace.  Note that
// namespace.emit does not support acknowlegements / callbacks.  The socket ID for / is the
// same as the /chat namespace, just with /chat# prefixed.
// The server can communicate across different namespaces with io.of('/admin').emit('ns', text'),
// but the client socket is defined for // ONE namespace.  One has to define more than one
// socket to listen to different name spaces on the client.

// The return ws message corresponds to the shape expected by the ws-client:
// Class WebSocketMessage {
//     sender,
//     messageText,
//     content,
//     messageType,
//     action,
//     objectName,
//     objectID,
//     severity,
//     messageDateTime
// }
io.on('connect', (socket, req) => {

    // .emit emits an event to the socket identified by the event name (ie welcome below).  It
    // can take args (data to be send to the client) and an optional callback which will be called
    // with the client's answer.
    // socket.emit() sends a message to one client
    // socket.to(roomName).emit() sends a messages to all clients in that room, except the sending socket
    // socket.to(anotherSocketID).emit() sends a message from one socket to another socket
    // io.of(aNamespace).to(roomName).emit() sends a message to any room
    // io.emit(), io.of('/').emit(), io.of('/admin').emit() sends a message to the entire namespace

    // socket.emit('welcome', 'Welcome to web socket server');
    // namespace.to('room').emit() sends to ALL sockets in the room
    // socket.to('room').emit('eventName', data) sends only to this room, but NOT the socket itself (sender)
    // socket.join(room, [callback]) - to join a room
    // socket.leave(room, [callback])

    // Join the canvasRoom room.  All clients belong to this room, but with socket.to(room).emit(),
    // the message is send to all clients, except this socket (sender).  Makes it easier since
    // the client does not have to cater for it receiving its own messages
    socket.join('canvasRoom');

    // ,on registers a new handler for the given event name.  The callback will get whatever data
    // was sent over by the client, ie msg below.
    socket.on('canvasNS', (messageFromClient) => {
        debugWs(messageFromClient);
    });

    // Response to Sender
    setTimeout( () => {
        debugWs('Response to Sender')
        socket.emit('canvasNS',
        {
            sender: 'sender',
            messageText: 'Dashboard has been amended',
            content: { id: 101, name: "sent from Canvas Server 2" },
            messageType: 'canvasData',
            action: 'Add',
            objectName: 'dashboards',
            objectID: 101,
            severity: 'low',
            messageDateTime: new Date()
        }
        )
    }, 8000);

    // Response to others (excluding Sender)
    setTimeout( () => {
        debugWs(' Response to others (excluding Sender)')
        socket.to('canvasRoom').emit('canvasNS',
        {
            sender: 'sender',
            messageText: 'Another Client has joined the Canvas room',
            content: null,
            messageType: 'canvasSystem',
            action: null,
            objectName: null,
            objectID: null,
            severity: 'low',
            messageDateTime: new Date()
        }
        )
    }, 9000);

    // Broadcast to all users
    setTimeout( () => {
        debugWs('Broadcast to all users')
        io.emit('canvasNS', {
            sender: 'sender',
            messageText: 'Please take a break, now',
            content: null,
            messageType: 'canvasMessages',
            action: null,
            objectName: null,
            objectID: null,
            severity: 'low',
            messageDateTime: new Date()
        })
    }, 10000);

    // Standard event names
    socket.on('disconnecting', (reason) => {
        // fires prior to client disconnecting (but hasnot left rooms yet)
    });

    socket.on('disconnect', (reason) => {
        // fires when a client disconnected
        // socket.leave(room, [callback])
        // Rooms are left automatically on disconnect
    });

    socket.on('error', (err) => {
        // fires when an error occured
    });

});




// Listen on provided port, on all network interfaces.
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);


// Functions to follow:


// Event listener for HTTP server "error" event.
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    };

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

// Event listener for HTTP server "listening" event.
function onListening() {

    // Read the caching table, and store into global variable
    const dataCachingTable = require('../utils/dataCachingTableMemory');
    const dataCachingTableSchema = '../model/dataCachingTable';
    const dataCachingTableModel = require(dataCachingTableSchema);

    // Find the DataCachingTable
    dataCachingTableModel.find( {}, (err, docs) => {

        // Warn if empty
        if (docs.length == 0) {
            console.log('');
            console.log('SERIOUS ERROR: The dataCachingTable is empty!');
            console.log('');
        };

        // Put data into global variable
        dataCachingTable.set(docs);

        // Store global variable in local and show (not really needed here)
        const localDataCachingTable = dataCachingTable.get();
        // console.log('The localDataCachingTable: ', localDataCachingTable);

        // Log for user to see
        const cacheMessage = docs.length >= 0?  'With data caching on server'  :  'NO data caching on server';
        console.log('');
        console.log('Canvas Server started ...');
        console.log('       Listening on port ' + port);
        console.log('       ' + cacheMessage);
        console.log('       morgan (HTTP method logging) is', config.get('morgan.logging'))
        console.log('----------------------------------------------------------------')
        console.log('');

    });
}
