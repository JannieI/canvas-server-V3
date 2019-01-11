// Model for widgetCheckpoints collection

// Imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const counterModel = require('./counters')

// Schema
const WidgetCheckpointSchema = new Schema({
    id: Number,                             // Unique ID
    parentWidgetIsDeleted: Boolean,         // True if W it belongs to has been deleted.
    // This is kept to perform an Undo when the W is restored.
    active: Boolean,                        // Set at RunTime: true if currently shown
    dashboardID: Number,                    // Linked to this D
    widgetID: Number,                       // Linked to this W
    originalID: Number,                     // Copied from this ID
    name: String,                           // Name of Checkpoint
    widgetSpec: Object,                     // json spec of W
    creator: String,                        // UserID
    createdOn: {                            // Date task was created
        type: Date,
        // `Date.now()` returns the current unix timestamp as a Number,        default: Date.now
    }
});

// This pre-hook is called before the information is saved into the database
WidgetCheckpointSchema.pre('save', function(next) {
    var doc = this;

    // Find in the counters collection, increment and update
    counterModel.findOneAndUpdate(
        {_id: 'widgetCheckpoints.id'},
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
const WidgetCheckpointModel = mongoose.model(
    'widgetCheckpoints', 
    WidgetCheckpointSchema, 
    'widgetCheckpoints'
);

// Export
module.exports = WidgetCheckpointModel;