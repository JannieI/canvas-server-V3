// Model for datasourceScheduleLogs collection

// Imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const counterModel = require('./counters')

// Schema
const DatasourceScheduleLogSchema = new Schema({
    id: Number,                             // Unique ID
    datasourceID: Number,                   // D that was linked
    userID: String,                         // User to whom D was sent
    groupID: String,                        // Optional Group to which D was sent
    sentOn: Date,                           // Date dispatched
    status: String,                         // Pending, Halted, Success, Failed
    errorMessage: String                    // Error message if it failed
});

// This pre-hook is called before the information is saved into the database
DatasourceScheduleLogSchema.pre('save', function(next) {
    var doc = this;

    // Find in the counters collection, increment and update
    counterModel.findOneAndUpdate(
        {_id: 'datasourceScheduleLogs.id'},
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
const DatasourceScheduleLogModel = mongoose.model(
    'datasourceScheduleLogs', 
    DatasourceScheduleLogSchema, 
    'datasourceScheduleLogs'
);

// Export
module.exports = DatasourceScheduleLogModel;