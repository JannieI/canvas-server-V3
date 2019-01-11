// Model for statusBarMessageLogs collection

// Imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const counterModel = require('./counters.model.model')

// Schema
const StatusBarMessageLogSchema = new Schema({
    id: Number,                             // Unique ID
    logDateTime: Date,                      // When message was logged
    userID: String,                         // User for which message was logged
    dashboardID: Number,                    // Optional Dashboard open when message received
    dashboardName: String,                  // Optional Dashboard name, filled @RunTime
    message: String,                        // Text to display
    uiArea: String,                         // Specific UI area to affect, ie StatusBar
    classfication: String,                  // Info, Warning, Error
    timeout: Number,                        // Duration to stay in ms, default = 3000
    defaultMessage: String,                 // Optional Message to display after timeout
});

// This pre-hook is called before the information is saved into the database
StatusBarMessageLogSchema.pre('save', function(next) {
    var doc = this;

    // Find in the counters collection, increment and update
    counterModel.findOneAndUpdate(
        {_id: 'statusBarMessageLogs.id'},
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
const StatusBarMessageLogModel = mongoose.model('statusBarMessageLogs', StatusBarMessageLogSchema, 'statusBarMessageLogs');

// Export
module.exports = StatusBarMessageLogModel;