// Model for CanvasGroups collection

// Imports
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

// Schema
const CanvasGroupSchema = new Schema({
    id: Number,                             // Unique Group ID
    name: String,                           // Group name
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
const CanvasGroupModel = mongoose.model('canvasGroups', CanvasGroupSchema, 'canvasGroups');

// Export
module.exports = CanvasGroupModel;