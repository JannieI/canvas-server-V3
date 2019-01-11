// Model for paletteButtonBars collection

// Imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const counterModel = require('./counters.model')

// Schema
const PaletteButtonBarSchema = new Schema({
    id: Number,                             // Unique record ID
    mainmenuItem: String,                   // True if belongs to main menu
    menuText: String,                       // Text that appears on menu
    shape: String,                          // Clarity shape of icon
    size: Number,                           // Size of icon
    class: String,                          // 
    backgroundColor: String,                // Bg Colour of button
    accesskey: String,                      // Shortcut key
    sortOrder: Number,                      // Nr (used for sorting)
    sortOrderSelected: Number,              // SortOrder once selected, null ind DB, calced @Runtime
    isDefault: Boolean,                     // True if in initial system setting
    functionName: String,                   // Typescript function to call when clicked
    params: String,                         // Parameters to pass the TS function
    tooltipContent: String,                 // Text in tooltip
    isSelected: Boolean,                    // Toggled at Runtime

});

// This pre-hook is called before the information is saved into the database
PaletteButtonBarSchema.pre('save', function(next) {
    var doc = this;

    // Find in the counters collection, increment and update
    counterModel.findOneAndUpdate(
        {_id: 'paletteButtonBars.id'},
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
const PaletteButtonBarModel = mongoose.model(
    'paletteButtonBars', 
    PaletteButtonBarSchema, 
    'paletteButtonBars');

// Export
module.exports = PaletteButtonBarModel;