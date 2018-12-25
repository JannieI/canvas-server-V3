// Model for CanvasBackgroundcolours collection

// Imports
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const AutoIncrement = require('mongoose-sequence')(mongoose);

// Schema - corresponds to CSScolor model on Workstation
const CanvasBackgroundcolorSchema = new Schema({
    id: Number,                             // Unique record ID
    name: String,                           // Name, ie brown
    cssCode: String,                        // CSS code, as name, hex, rgb.  ie transparent, rgb(111,52,78)
    shortList: Boolean,                     // True if part of shorter list
});

// Auto-Incement the id field
CanvasBackgroundcolorSchema.plugin(AutoIncrement, {inc_field: 'id'});

// Create Model: modelName, schema, collection
const CanvasBackgroundcolorModel = mongoose.model(
    'canvasBackgroundcolors', CanvasBackgroundcolorSchema, 'canvasBackgroundcolors');

// Export
module.exports = CanvasBackgroundcolorModel;