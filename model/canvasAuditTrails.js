// Model for canvasAuditTrails collection

// Imports
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const AutoIncrement = require('mongoose-sequence')(mongoose);

// Schema
const CanvasAuditTrailSchema = new Schema({
    id: Number,                             // Unique ID
    name: String,                           // Name
    editedBy: String,                       // Last user who edited this task
    editedOn: Date,                         // Date this task was last edited
    createdBy: String,                      // UserID who created this task, can be System
    createdOn: {                            // Date task was created
        type: Date,
        // `Date.now()` returns the current unix timestamp as a number
        default: Date.now
    }
});

// Auto-Incement the id field
CanvasAuditTrailSchema.plugin(AutoIncrement, {inc_field: 'id'});

// Create Model: modelName, schema, collection
const CanvasAuditTrailModel = mongoose.model('canvasAuditTrails', CanvasAuditTrailSchema, 'canvasAuditTrails');

// Export
module.exports = CanvasAuditTrailModel;