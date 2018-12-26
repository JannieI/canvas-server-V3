// Model for counter

// Imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema
const CounterSchema = Schema({
    _id: {type: String, required: true},        // collection.field name to make it unique
    seq: { type: Number, default: 0 }           // Sequence number, 0, 1, 2 ...
});

// Create Model: modelName, schema, collection
const CounterModel = mongoose.model('counter', CounterSchema, 'counter');

// Export
module.exports = CounterModel;