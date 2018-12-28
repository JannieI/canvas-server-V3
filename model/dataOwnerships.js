// Model for dataOwnerships collection

// Imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const counterModel = require('./counters')

// Schema
const DataOwnershipSchema = new Schema({
    dateCreated: {                            // Date task was created
        type: Date,
    },
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