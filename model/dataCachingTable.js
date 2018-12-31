// Model for dataCachingTable collection

// Schema for Datacaching table
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const DataCachingTableSchema = new Schema({
    key: String,                            // Unique key
    objectID: Number,                       // Optional record ID, ie for Data
    serverCacheableMemory: Boolean,         // True if cached on server in RAM
    serverCacheableDisc: Boolean,           // True if cached on server on Disc (DB)
    serverThresholdLines: Number,           // Max Nr lines that may be cached on Server
    serverLastUpdatedDateTime: Date,        // When cached last refreshed on server
    serverExpiryDateTime: Date,             // When cache expires on server
    serverLastWSsequenceNr: Number,         // Last WSockets message nr sent for this
    serverVariableName: String,             // VariableName for the data on the server
    localCacheableMemory: Boolean,          // True if cached locally, ie IndexedDB in RAM
    localCacheableDisc: Boolean,            // True if cached locally, ie IndexedDB on Disc (DB)
    localThresholdLines: Number,            // Max Nr lines that may be cached on Workstation
    localLastUpdatedDateTime: Date,         // When local cache last refreshed
    localExpiryDateTime: Date,              // When local cache expries
    localVariableName: String,              // Optional name of memory variable
    localCurrentVariableName: String,       // Optional name of memory current variable
    localTableName: String,                 // Optional name of Table in IndexedDB
    localLastWebSocketNumber: Number        // Last WS number processed
});

// Create Model: modelName, schema, collection
const DataCachingTableModel = mongoose.model(
    'dataCachingTable', 
    DataCachingTableSchema, 
    'dataCachingTable'
);

module.exports = DataCachingTableModel;