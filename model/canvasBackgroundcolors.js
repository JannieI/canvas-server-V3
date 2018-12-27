// Model for canvasBackgroundcolours collection

// Imports
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const counterModel = require('./counters')

// Schema - corresponds to CSScolor model on Workstation
const CanvasBackgroundcolorSchema = new Schema({
    id: Number,                             // Unique record ID
    name: String,                           // Name, ie brown
    cssCode: String,                        // CSS code, as name, hex, rgb.  ie transparent, rgb(111,52,78)
    shortList: Boolean,                     // True if part of shorter list
});

// This pre-hook is called before the information is saved into the database
CanvasBackgroundcolorSchema.pre('save', function(next) {
    var doc = this;

    // Find in the counters collection, increment and update
    counterModel.findOneAndUpdate(
        {_id: 'canvasBackgroundcolors.id'},
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
const CanvasBackgroundcolorModel = mongoose.model(
    'canvasBackgroundcolors', CanvasBackgroundcolorSchema, 'canvasBackgroundcolors');

// Export
module.exports = CanvasBackgroundcolorModel;