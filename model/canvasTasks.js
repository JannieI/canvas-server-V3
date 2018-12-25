// Model for CanvasTasks collection

// Imports
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const AutoIncrement = require('mongoose-sequence')(mongoose);

// Schema
const CanvasTaskSchema = new Schema({
    id: Number,                             // Unique task ID
    taskText: String,                       // Description of task
    activityType: String,                   // Type of Task (or Activity)
    taskStatus: String,                     // Status, ie Draft, Completed
    assignedToUserID: String,               // UserID to whom this was assigned

    precedingTaskID: Number,                // Optional task on which this one depends
    linkedDashboardID: Number,              // Optional D-ID linked to this task
    taskComments: [{type: String}],         // Immutable array of comments / feedback (userID, dt, text)
    startDate: Date,                        // Date when task should start
    deadlineDate: Date,                     // Date when task should end
    endDate: Date,                          // Date when task ended
    durationDays: Number,                   // Duration in days

    // Generated by the system
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
CanvasCommentSchema.plugin(AutoIncrement, {inc_field: 'id'});

// Create Model: modelName, schema, collection
const CanvasTaskModel = mongoose.model('canvasTasks', CanvasTaskSchema, 'canvasTasks');

// Export
module.exports = CanvasTaskModel;