// Model for dataQualityIssues collection

// Imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const counterModel = require('./counters.model')

// Schema
const DataQualityIssueSchema = new Schema({
    id: Number,                             // Unique record ID
    name: String,                           // Short name to identify issue
    datasourceID: Number,                   // DS to which the issue relates
    status: String,                         // Status: Logged, InProgress, Solved
    type: String,                           // User-defined type, ie Stats, Backfill
    description: String,                    // Description of the issue
    nrIssues: Number,                       // Optional Nr of issue, can be rounded
    loggedBy: String,                       // UserID who logged the issue
    loggedOn: Date,                         // Date Issue was logged
    solvedBy: String,                       // UserID who solved the issue
    solvedOn: Date,                         // Date issue was marked as solved
});

// This pre-hook is called before the information is saved into the database
DataQualityIssueSchema.pre('save', function(next) {
    var doc = this;

    // Find in the counters collection, increment and update
    counterModel.findOneAndUpdate(
        {_id: 'dataQualityIssues.id'},
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
const DataQualityIssueModel = mongoose.model('dataQualityIssues', DataQualityIssueSchema, 'dataQualityIssues');

// Export
module.exports = DataQualityIssueModel;