// Model for containerStyles collection

// Imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const counterModel = require('./counters')

// Schema
const containStyleSchema = new Schema({
    _id: String,                           // Mongo ID (read only)
    id: Number,                             // Unique ID
    name: String,                           // Unique Name of style

    // Container
    containerBackgroundcolor: String,       // Actual colour (CSS name or HEX code)
    containerBackgroundcolorName: String,   // Name - CSS (ie black) or Custome Name (Our company blue)
    containerBorderColour: String,          // Actual colour (CSS name or HEX code)
    containerBorderColourName: String,      // Name - CSS (ie black) or Custome Name (Our company blue)
    containerBorderRadius: String,          // Border radius in px
    containerBorderSize: String,            // Size of border in px
    containerBorderType: String,            // Type of border, dotted or solid
    containerBoxshadow: String,             // Border shadow, ie 2px 2px gray
    containerFontsize: Number,              // Size of container and text font, in px

    // Shape
    shapeFontFamily: String,                // Font, ie Aria, Sans Serif
    shapeIsBold: Boolean,                   // True if text is bold
    shapeIsItalic: Boolean,                 // True if text is italic
    shapeLineHeight: String,                // Line Height: normal, 1.6, 80%
    shapeTextAlign: String,                 // Align text Left, Center, Right

    // Created, updated
    containerUpdatedOn: Date,               // Updated on
    containerUpdatedBy: String,             // Updated by
    containerCreatedBy: String,             // Created by
    containerCreatedOn: {                            // Date task was created
        type: Date,
        // `Date.now()` returns the current unix timestamp as a Number,        default: Date.now
    }
});

// This pre-hook is called before the information is saved into the database
containStyleSchema.pre('save', function(next) {
    var doc = this;

    // Find in the counters collection, increment and update
    counterModel.findOneAndUpdate(
        {_id: 'containerStyles.id'},
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
const containStyleModel = mongoose.model('containerStyles', containStyleSchema, 'containerStyles');

// Export
module.exports = containStyleModel;