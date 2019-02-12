// Model for dashboards collection

// Imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const counterModel = require('./counters.model')
const widgetSchema = './widgets.model';

const widgets = require(widgetSchema);

// Schema
const DashboardSchema = new Schema(
    {
        id: Number,                             // Unique ID
        originalID: Number,                     // ID of the original (Completed state) for a draft
        draftID: Number,                        // ID of the Draft version for a Complete
        version: Number,                        // Version of the Dashboard
        state: String,                          // State, ie Complete, Draft
        code: String,                           // Short code for D
        name: String,                           // Dashboard Name
        description: String,                    // User description

        // Access Type
        accessType: String,                     // How to access D: Private, Public, AccessList

        // Overall properties
        password: String,                       // Optional password to lock Dashboard
        refreshMode: String,                    // OnDemand, OnOpen, Repeatedly
        refreshTimer: Number,                   // Nr seconds to repeat, if refreshMode = Repeatedly
        defaultTabID: Number,       
        defaultExportFileType: String,          // Default file type on export
        url: String,            
        qaRequired: Boolean,    
        isSample: Boolean,                      // True if this is a sample

        // Overlay looks
        backgroundColor: String,    
        backgroundImage: String,
        templateDashboardID: Number,

        // Creation, update and refresh
        creator: String,                        // Creator UserID
        dateCreated: {                          // Date task was created
            type: Date,
        },
        editor: String,                         // Last UserID who edited this Dashboard
        dateEdited: Date,                       // Last Edit dt
        refresher: String,                      // Last UserID who refreshed this Dashboard, and it data
        dateRefreshed: Date,                    // Last refresh dt

        // 2nd normal form - calculated at DB level
        nrWidgets: Number,                      // Nr of Widgets on Dashboard
        nrShapes: Number,                       // Nr of Shapes on Dashboard
        nrRecords: Number,          
        nrTimesOpened: Number,                  // Nr of times this Dashboard has been opened
        nrTimesChanged: Number,                 // Nr of times this Dashboard has been edited
        tabs: [ { type: Number } ],             // Array of TabIDs in this Dashboard
        permissions: [ { type: String } ]      
    }
);

// Example - Works
// DashboardSchema.virtual('full')
//     .get(function () {
//         return this.code + this.name;
// });

// Works - brings back ALL Ws for now ...
// Note: had to ref 'widgets' model, returned by require(...)
DashboardSchema.virtual('numberWidgets', {
    ref: 'widgets', // The model to use
    localField: 'id', // Find people where `localField`
    foreignField: 'dashboardID', // is equal to `foreignField`
    count: true // And only get the number of docs
});


// This pre-hook is called before the information is saved into the database
DashboardSchema.pre('save', function(next) {
    var doc = this;

    // Find in the counters collection, increment and update
    counterModel.findOneAndUpdate(
        {_id: 'dashboards.id'},
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
const DashboardModel = mongoose.model('dashboards', DashboardSchema, 'dashboards');

// Export
module.exports = DashboardModel;