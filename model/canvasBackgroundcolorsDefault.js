// Model for CanvasBackgroundcoloursDefault collection

// Imports
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

// Schema
const CanvasBackgroundcolorsDefaultSchema = new Schema({
    id: Number,                             // Unique record ID
    name: String,                           // Name, ie brown
    cssCode: String,                        // CSS code, as name, hex, rgb.  ie transparent, rgb(111,52,78)
    shortList: Boolean,                     // True if part of shorter list
});


// Create Model: modelName, schema, collection
const CanvasBackgroundcolorsDefaultModel = mongoose.model(
    'canvasBackgroundcolorsDefault', 
    CanvasBackgroundcolorsDefaultSchema, 
    'canvasBackgroundcolorsDefault'
);

// Export
module.exports = CanvasBackgroundcolorsDefaultModel;