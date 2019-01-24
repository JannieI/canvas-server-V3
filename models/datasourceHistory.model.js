// Model for datasource History collection

// Imports
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

// Schema
const DatasourceHistorySchema = new Schema({
    createdBy: String,                      // UserID who created this record
    createdOn: {                            // Date record was created
        type: Date,
        // `Date.now()` returns the current unix timestamp as a number
        default: Date.now
    },
    datasource: Object
});
 
// Create Model: modelName, schema, collection
const DatasourceHistoryModel = mongoose.model('datasourceHistory', DatasourceHistorySchema, 'datasourceHistory');

// Export
module.exports = DatasourceHistoryModel;