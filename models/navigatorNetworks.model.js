// Model for Navigator Network

// Imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const counterModel = require('./counters.model')
const datasourceHistoryModel = require('./datasourceHistory.model')

// Schema
const NavigatorNetworkSchema = new Schema({

    id: Number,                             // Unique record ID
    name: String,                           // Name of Datasource
    description: String,                    // Description of the DS
    
    accessType: String,                     // How to access D: Private, Public, AccessList
    relationshipDatasourceID: Number,       // ID for the DS that contains the relationships
    propertiesDatasourceID: Number,         // ID for DS that contains the Properties
 
    createdBy: String,                      // Creator
    createdOn: {                            // Date task was created
        type: Date,
        // `Date.now()` returns the current unix timestamp as a Number,        default: Date.now
    },
    editor: String,                         // Last Edited By
    dateEdited: Date,                       // Last Edited On

});

// This pre-hook is called before the information is saved into the database
NavigatorNetworkSchema.pre('save', function(next) {
    var doc = this;

    // Find in the counters collection, increment and update
    counterModel.findOneAndUpdate(
        {_id: 'navigatorNetworks.id'},
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
const NavigatorNetworkModel = mongoose.model('navigatorNetworks', NavigatorNetworkSchema, 'navigatorNetworks');

// Export
module.exports = NavigatorNetworkModel;


 
