// Imports
var app = require('../app');    // This is where all the routing happens
var debug = require('debug')('canvas-server:server');
var http = require('http');

// Get port from environment, else use default
const port = typeof process.env.SERVER_PORT == 'number'?  process.env.SERVER_PORT  :  8000;

// Create HTTP server.
const server = http.createServer(app);

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
        const cacheMessage = docs.length >= 0?  '(with data caching on server)'  :  '(NO data caching on server)';
        console.log('');
        console.log('Canvas Server started ' + cacheMessage + '. Listening on port ' + port);
        console.log('----------------------------------------------------------------')
        console.log('');

    });
}
