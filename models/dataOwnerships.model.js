// Model for dataOwnerships collection

// Imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const counterModel = require('./counters')

// Schema
const DataOwnershipSchema = new Schema({
    id: Number,                             // Unique record ID
    datasourceID: Number,                   // DS for which the ownership is defined
    userID: String,                         // Short name to identify issue
    type: String,                           // User-defined ownership role, ie Owner, Steward, etc
    description: String,                    // Description of the responsibilities
    updatedBy: String,                      // UserID who last updated the record
    updatedOn: Date,                        // Last Date when record was updated
    createdBy: String,                      // UserID who created the record
    createdOn: {                            // Date task was created
        type: Date,
        // `Date.now()` returns the current unix timestamp as a Number,        default: Date.now
    },

    // @RunTime
    datasourceName: String,                 // Name of the linked DS
});

// This pre-hook is called before the information is saved into the database
DataOwnershipSchema.pre('save', function(next) {
    var doc = this;

    // Find in the counters collection, increment and update
    counterModel.findOneAndUpdate(
        {_id: 'dataOwnerships.id'},
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
const DataOwnershipModel = mongoose.model('dataOwnerships', DataOwnershipSchema, 'dataOwnerships');

// Export
module.exports = DataOwnershipModel;