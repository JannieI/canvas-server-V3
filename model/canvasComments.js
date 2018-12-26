// Model for canvasComments collection

// Imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AutoIncrement = require('mongoose-sequence')(mongoose);
require('./counters')

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

// This pre-hook is called before the information is saved into the database
CanvasCommentSchema.pre('save', function(next) {
    var doc = this;
    counter.findByIdAndUpdate({_id: 'canvasComments.id'}, {$inc: { seq: 1} }, function(error, counter)   {
        if(error)
            return next(error);
        doc.testvalue = counter.seq;
        next();
    });
});
// Auto-Incement the id field
// CanvasCommentSchema.plugin(AutoIncrement, {inc_field: 'id'});

// Create Model: modelName, schema, collection
const CanvasCommentModel = mongoose.model('canvasComments', CanvasCommentSchema, 'canvasComments');

// Export
module.exports = CanvasCommentModel;