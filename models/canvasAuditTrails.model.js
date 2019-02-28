// Model for canvasAuditTrails collection

// Imports
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const counterModel = require('./counters.model')

// Schema
const CanvasAuditTrailSchema = new Schema({
    id: Number,                             // Unique id per action
    dashboardID: Number,                    // Where action took place
    dashboardTabID: Number,                 // Where action took place
    widgetID: Number,                       // If linked to a Widget

    objectType: String,                     // Dashboard, Widget
    actionType: String,                     // Add, Delete, Change, Open
    action: String,                         // Sub action type, ie Move Widget
    description: String,                    // Optional description, ie calling routine, etc

    keyChanged: String,                     // Field / key that was changed
    oldValue: String,                       // Value prior to change
    newValue: String,                       // Value after change

    userID: String,                         // User who made change
    changedOn: Date                         // Date Time of log, when changes was made  
});

// This pre-hook is called before the information is saved into the database
CanvasAuditTrailSchema.pre('save', function(next) {
    var doc = this;

    // Find in the counters collection, increment and update
    counterModel.findOneAndUpdate(
        {_id: 'canvasAuditTrails.id'},
        {$inc: { seq: 1} },
        { upsert: true, new: true },
        function(error, counter)   {
            if(error) {
                console.error('Error: findOneAndUpdate in canvasAuditTrails failed.' + error.message);
                return next(error);
            };

            doc.id = counter.seq;
            next();
        }
    );
});

// Create Model: modelName, schema, collection
const CanvasAuditTrailModel = mongoose.model('canvasAuditTrails', CanvasAuditTrailSchema, 'canvasAuditTrails');

// Export
module.exports = CanvasAuditTrailModel;