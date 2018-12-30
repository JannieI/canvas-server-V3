// Model for widgets collection - a portion of the fields to try to get it working

// Imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const counterModel = require('./counters')

// Schema
const WidgetSchema = new Schema({
    id: Number,                             // Unique record / document ID
});

// This pre-hook is called before the information is saved into the database
WidgetSchema.pre('save', function(next) {
    var doc = this;

    // Find in the counters collection, increment and update
    counterModel.findOneAndUpdate(
        {_id: 'widgets.id'},
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
const WidgetModel = mongoose.model('widgets', WidgetSchema, 'widgets');

// Export
module.exports = WidgetModel;