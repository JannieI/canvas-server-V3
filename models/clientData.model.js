// Model for clientData collection

// Imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const counterModel = require('./counters.model')

// Schema
const ClientDataSchema = new Schema({
    id: Number,                             // Unique record / document ID
    data: Array,                            // Data Array (of json objects)
});

// This pre-hook is called before the information is saved into the database
ClientDataSchema.pre('save', function(next) {
    var doc = this;

    if (doc.id == null) {
        // Find in the counters collection, increment and update
        counterModel.findOneAndUpdate(
            {_id: 'clientData.id'},
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
    } else { 
        next();
    }
});

// Create Model: modelName, schema, collection
const ClientDataModel = mongoose.model('clientData', ClientDataSchema, 'clientData');

// Export
module.exports = ClientDataModel;