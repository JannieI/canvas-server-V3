// Model for CanvasComments collection

// Imports
const mongoose = require('mongoose');
// autoIncrement = require('mongoose-auto-increment');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const Schema = mongoose.Schema;

// Schema
const CanvasCommentSchema = new Schema({
    dashboardID: Number,                    // Dashboard to which comment is linked
    widgetID: Number,                       // Optional Widget linked
    comment: String,                        // Comment Text
    creator: String,                        // UserID
    createdOn: {                            // Date task was created
        type: Date,
        // `Date.now()` returns the current unix timestamp as a Number,        default: Date.now
    }
});

// Auto-Incement the id field
CanvasCommentSchema.plugin(AutoIncrement, {inc_field: 'id'});

// CanvasCommentSchema.plugin(AutoIncrement, 'id');

// Create Model: modelName, schema, collection
const CanvasCommentModel = mongoose.model('canvasComments', CanvasCommentSchema, 'canvasComments');

// Export
module.exports = CanvasCommentModel;