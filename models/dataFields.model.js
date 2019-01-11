// Model for dataFields collection

// Imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const counterModel = require('./counters.model')

// Schema
const DataFieldSchema = new Schema({
    id: Number,                             // Unique ID
    tableID: Number,                        // DataTable to which the Field belongs
    nameDB: String,                         // Field Name (in DB)
    nameLocal: String,                      // Optional Local Field Name (shown in D)
    type: String,                           // String, Number, Boolean
    format: String,                         // Optional, ie YYYY/MM/DD
    filterOperand: String,                  // Optional filter operand, ie '>='
    filterValue: String,                    // Optional filter value, ie '1'
    calculation: String,                    // Optional Calculation, ie 'OtherFieldName / 2'
    orderSequence: Number,                  // Optional order sequence
    orderDirection: String,                 // Optional order direction, Asc / Desc
    description: String,                    // Detailed description of field (technical terms)
    businessGlossary: String,               // Detailed business oriented description of field (non-technical)
    keyField: Boolean,                      // True if a key field - used for explanedBy (later use)
    explainedBy: String,                    // Graph (bar chart of ...) that explains field if key field is true (later use)

    // Creation, update and refresh
    creator: String,                        // Created By
    dateCreated: {                            // Date task was created
        type: Date,
    },
    editor: String,                         // Last Edited By
    dateEdited: Date,                       // Last Edited On

    // At Runtime
    hidden: Boolean,                        // True if hidden at runtime

});

// This pre-hook is called before the information is saved into the database
DataFieldSchema.pre('save', function(next) {
    var doc = this;

    // Find in the counters collection, increment and update
    counterModel.findOneAndUpdate(
        {_id: 'dataFields.id'},
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
const DataFieldModel = mongoose.model('dataFields', DataFieldSchema, 'dataFields');

// Export
module.exports = DataFieldModel;