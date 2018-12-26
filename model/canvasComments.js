// Model for canvasComments collection

// Imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const counterModel = require('./counters')

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
    counterModel.findByIdAndUpdate({_id: 'canvasComments.id'}, {$inc: { seq: 1} }, function(error, counter)   {
        if(error)
            return next(error);
        doc.id = counterModel.seq;
        next();
    });
});

// Create Model: modelName, schema, collection
const CanvasCommentModel = mongoose.model('canvasComments', CanvasCommentSchema, 'canvasComments');

// Export
module.exports = CanvasCommentModel;