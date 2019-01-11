// Model for canvasGroups collection

// Imports
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const counterModel = require('./counters.model')

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

// This pre-hook is called before the information is saved into the database
CanvasGroupSchema.pre('save', function(next) {
    var doc = this;

    // Find in the counters collection, increment and update
    counterModel.findOneAndUpdate(
        {_id: 'canvasGroups.id'},
        {$inc: { seq: 1} },
        { upsert: true, new: true },
        function(error, counter)   {
            if(error) {
                return next(error);
            };

            doc.id = counter.seq;
            next();
        }
    );
});

// Create Model: modelName, schema, collection
const CanvasGroupModel = mongoose.model('canvasGroups', CanvasGroupSchema, 'canvasGroups');

// Export
module.exports = CanvasGroupModel; 