// Model for dashboardsRecent collection

// Imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const counterModel = require('./counters')

// Schema
const DashboardsRecentSchema = new Schema({
    id: Number,                             // Unique ID
    userID: String,                         // User who last saved the D
    dashboardID: Number,                    // Last D position
    dashboardTabID: Number,                 // Last T position
    editMode: Boolean,                      // EditMode when last saved
    accessed: Date,                         // Last dateTime opened
    stateAtRunTime: String,                 // State when opened, ie Deleted
    nameAtRunTime: String,                  // Name when opened
});

// This pre-hook is called before the information is saved into the database
DashboardsRecentSchema.pre('save', function(next) {
    var doc = this;

    // Find in the counters collection, increment and update
    counterModel.findOneAndUpdate(
        {_id: 'dashboardsRecent.id'},
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
const DashboardsRecentModel = mongoose.model('dashboardsRecent', DashboardsRecentSchema, 'dashboardsRecent');

// Export
module.exports = DashboardsRecentModel;