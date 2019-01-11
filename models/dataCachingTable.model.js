// Model for dataCachingTable collection

// Schema for Datacaching table
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const DataCachingTableSchema = new Schema({
    key: String,                            // Unique key
    objectID: Number,                       // Optional record ID, ie for Data
    messageDateTime: Date,                  // DateTime message was sent
    localCacheableDisc: Boolean,            // True if cached locally, ie IndexedDB on Disc (DB)
    localCacheableMemory: Boolean,          // True if cached locally, ie IndexedDB in RAM
    localCurrentVariableName: String,       // Optional name of memory current variable
    localExpiryDateTime: Date,              // When local cache expries
    localLastUpdatedDateTime: Date,         // When local cache last refreshed
    localLifeSpan: Number,                  // Period in seconds before Workstation cache must be refreshed
    localTableName: String,                 // Optional name of Table in IndexedDB
    localThresholdLines: Number,            // Max Nr lines that may be cached on Workstation
    localVariableName: String,              // Optional name of memory variable
    serverCacheableDisc: Boolean,           // True if cached on server on Disc (DB)
    serverCacheableMemory: Boolean,         // True if cached on server in RAM
    serverExpiryDateTime: Date,             // When cache expires on server
    serverLastUpdatedDateTime: Date,        // When cached last refreshed on server
    serverLastWSsequenceNr: Number,         // Last WSockets message nr sent for this
    serverLifeSpan: Number,                 // Period in seconds before Server cache must be refreshed
    serverThresholdLines: Number,           // Max Nr lines that may be cached on Server
    serverVariableName: String              // VariableName for the data on the server
});

// Create Model: modelName, schema, collection
const DataCachingTableModel = mongoose.model(
    'dataCachingTable', 
    DataCachingTableSchema, 
    'dataCachingTable'
);

module.exports = DataCachingTableModel;