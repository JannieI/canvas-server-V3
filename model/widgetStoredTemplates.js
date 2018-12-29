// Model for widgetStoredTemplates collection

// Imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const counterModel = require('./counters')

// Schema
const WidgetStoredTemplateSchema = new Schema({
    id: Number,                             // Unique ID
    widgetID: Number,                       // FK to Widgets, where all the data is stored
    name: String,                            // Name
    description: String,                    // Description
    datasourceName: String,                 // Added at RunTime
    updatedOn: Date,                        // Updated on
    updatedBy: String,                      // Updated by
    createdBy: String,                      // Created by
    createdOn: {                            // Date task was created
        type: Date,
        // `Date.now()` returns the current unix timestamp as a Number,        default: Date.now
    }
});

// This pre-hook is called before the information is saved into the database
WidgetStoredTemplateSchema.pre('save', function(next) {
    var doc = this;

    // Find in the counters collection, increment and update
    counterModel.findOneAndUpdate(
        {_id: 'widgetStoredTemplates.id'},
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
const WidgetStoredTemplateModel = mongoose.model('widgetStoredTemplates', WidgetStoredTemplateSchema, 'widgetStoredTemplates');

// Export
module.exports = WidgetStoredTemplateModel;