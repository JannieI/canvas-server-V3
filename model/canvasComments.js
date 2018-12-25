// Model for CanvasComments collection

// Imports
const mongoose = require('mongoose')
const AutoIncrement = require('mongoos-sequence')(mongoose);

const Schema = mongoose.Schema;

// Auto-Incement the id field
// UserSchema.plugin(AutoIncrement, {inc_field: 'id'});

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


// Create Model: modelName, schema, collection
const CanvasCommentModel = mongoose.model('canvasComments', CanvasCommentSchema, 'canvasComments');

// Export
module.exports = CanvasCommentModel;