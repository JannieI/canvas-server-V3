// Model for CanvasAuditTrails collection

// Imports
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

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


// Create Model: modelName, schema, collection
const CanvasAuditTrailModel = mongoose.model('canvasAuditTrails', CanvasAuditTrailSchema, 'canvasAuditTrails');

// Export
module.exports = CanvasAuditTrailModel;