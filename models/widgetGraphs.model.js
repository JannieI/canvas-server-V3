// Model for widgetGraphs collection

// Imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const counterModel = require('./counters')

// Schema
const WidgetGraphSchema = new Schema({
    id: Number,                             // Unique ID
    shortName: String,                      // Short name to display
    visualGrammar: String,                  // Vega-Lite, Vega, etc
    visualGrammarVersion: Number,           // Version, ie 2.0
    visualGrammarType: String,              // Type of spec: standard (ie bar) which uses spec
       // defined in code, custom (use specification specified here)
    mark: String,                           // Vega-lite: area, bar, line, etc
    specification: Object,                  // Grammar spec (template) - for custom
    imageUrl: String,                       // Url where image lives

    // @RunTime
    isSelected: Boolean,                    // True if this type is selected
});

// This pre-hook is called before the information is saved into the database
WidgetGraphSchema.pre('save', function(next) {
    var doc = this;

    // Find in the counters collection, increment and update
    counterModel.findOneAndUpdate(
        {_id: 'widgetGraphs.id'},
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
const WidgetGraphModel = mongoose.model(
    'widgetGraphs', 
    WidgetGraphSchema, 
    'widgetGraphs'
);

// Export
module.exports = WidgetGraphModel;