// Model for dataTables collection

// Imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const counterModel = require('./counters')

// Schema
const DataTableSchema = new Schema({
    id: Number,                             // Unique ID
    connectionID: Number,                   // Connection to which the Field belongs
    nameDB: String,                         // Field Name (in DB)
    nameLocal: String,                      // Optional Local Field Name (shown in D)
    type: String,                           // Table / View
    description: String,                    // Detailed description of the table
    businessGlossary: String,               // Detailed business oriented description of table (non-technical)

    // Creation, update and refresh
    creator: String,                        // Created By
    dateCreated: {                            // Date task was created
        type: Date,
    },
    editor: String,                         // Last Edited By
    dateEdited: Date,                       // Last Edited On


});

// This pre-hook is called before the information is saved into the database
DataTableSchema.pre('save', function(next) {
    var doc = this;

    // Find in the counters collection, increment and update
    counterModel.findOneAndUpdate(
        {_id: 'dataTables.id'},
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
const DataTableModel = mongoose.model('dataTables', DataTableSchema, 'dataTables');

// Export
module.exports = DataTableModel;