// Model for canvasBackgroundcoloursDefault collection

// Imports
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const counterModel = require('./counters.model')

// Schema
const CanvasBackgroundcolorsDefaultSchema = new Schema({
    id: Number,                             // Unique record ID
    name: String,                           // Name, ie brown
    cssCode: String,                        // CSS code, as name, hex, rgb.  ie transparent, rgb(111,52,78)
    shortList: Boolean,                     // True if part of shorter list
}); 

// This pre-hook is called before the information is saved into the database
CanvasBackgroundcolorsDefaultSchema.pre('save', function(next) {
    var doc = this;

    // Find in the counters collection, increment and update
    counterModel.findOneAndUpdate(
        {_id: 'canvasBackgroundcolorsDefault.id'},
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
 
// CanvasUserSchema.methods.getSchema = async function(){
//     const doc = this;
//     var props = Object.keys(canvasSchema.schema.paths);
// }

// Create Model: modelName, schema, collection
const CanvasBackgroundcolorsDefaultModel = mongoose.model(
    'canvasBackgroundcolorsDefault', 
    CanvasBackgroundcolorsDefaultSchema, 
    'canvasBackgroundcolorsDefault'
);

// Export
module.exports = CanvasBackgroundcolorsDefaultModel;