// Model for datasets collection

// Imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const counterModel = require('./counters')

// Sub-Schema
const DatasetFilter = new Schema({
    id: Number,                             // Unique ID
    dashboardID: Number,                    // FK to Dashboard
    sequence: Number,                       // Sequence Nr - for LATER user
    filterFieldName: String,                // Name (text) of field
    filterOperator: String,                 // ie Equal, Less Than, etc
    filterValue: String,                    // ie. 12 Japan  1,5  a,b,c  true
    filterValueFrom: String,                // From value for Range
    filterValueTo: String,                  // To value for Range
    isActive: Boolean,                      // True if activated, else not used
})

// Schema
const DatasetSchema = new Schema({
    id: Number,                             // Unique record ID
    datasourceID: Number,                   // FK to DS to which this belongs
    sourceLocation: String,                 // Where data lives: file, localDB, MSSQL, etc
    url: String,                            // URL for http request
    folderName: String,                     // Optional folder name where data is stored
    fileName: String,                       // Optional file name where data is stored
    cacheServerStorageID: String,           // s-id on Server of cached results
    cacheLocalStorageID: String,            // s-id Locally of cached results
    isLocalDirty: Boolean,                  // True means must get from server (cannot use local)
    data: Object,                           // Filtered data as json
    dataRaw: Object                         // Unfiltered data as json

});

// This pre-hook is called before the information is saved into the database
DatasetSchema.pre('save', function(next) {
    var doc = this;

    // Find in the counters collection, increment and update
    counterModel.findOneAndUpdate(
        {_id: 'datasets.id'},
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
const DatasetModel = mongoose.model('datasets', DatasetSchema, 'datasets');

// Export
module.exports = DatasetModel;