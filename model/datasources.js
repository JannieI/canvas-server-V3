// Model for datasources collection

// Imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const counterModel = require('./counters')

// Sub-Schema
const DatasourceFilter = new Schema({
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
const DatasourceSchema = new Schema({
    id: Number,                             // Unique record ID
    type: String,                           // Type of source, ie File, Server, Web, Service
    subType: String,                        // Subtype, ie Excel/ CSV for File, PostgreSQL/ Mongo for Server
    typeVersion: String,                    // Version of source, ie Excel 2016
    name: String,                           // Name of Datasource
    username: String,                       // Username to log into server (if not via AD)
    password: String,                       // Password to log into server
    description: String,                    // Description of the DS
    dataFieldIDs: [ { type: Number } ],     // IDs of fields in DB table
    dataFields: [ { type: String } ],       // FieldNames, in order to display
    dataFieldTypes: [ { type: String } ],   // Field Types, same order as dataFields
    dataFieldLengths: [ { type: Number } ], // Max field lengths, same order as dataFields

	// Parameters and Filters
    datasourceFilters: [ DatasourceFilter ],    // Optional Array of DS-Filters per Dashboard
    datasourceFilterForThisDashboard: Boolean,  // @ RunTime, changes: true if THIS D has filters on THIS DS

    // Access Type
    accessType: String,                     // How to access D: Private, Public, AccessList

    // Caching info
    cacheResultsOnServer: Boolean,          // True if results may be cached on server. Each Tr is decided separately
    unRefreshable: Boolean,                 // Can create once, but cannot Refresh after that
    cacheResultsLocal: Boolean,             // True if Local results must be cached
    nrCacheCopies: Number,                  // Nr Cache copies kept, 0 means none

    // Optional Max Oldness allowed - must be fresher than given
    oldnessMaxPeriodInterval: String,       // Ie. second, minute, hour, day, month, year
    oldnessMaxPeriodUnits: Number,          // Must be fresher than say 8 hour
    oldnessRelatedDate: String,             // Ie. today, yesterday, previousWorkingDay, weekStart, monthStart, yearStart
    oldnessRelatedTime: String,             // Ie. '08:00' - must be fresher than today 8:00

    // Refresh info
    refreshedBy: String,                    // Last UserID that refreshed this datasource
    refreshedServerOn: Date,                // Last dateTime this DS was refreshed on Server
    refreshedLocalOn: Date,                 // Last dateTime this DS was refreshed locally

    // Location and authentication
    folder: String,                         // Folder from which the data was loaded
    fileName: String,                       // Filename from which the data was loaded
    excelWorksheet: String,                 // Excel Worksheet name from which the data was loaded
    transposeOnLoad: Boolean,               // True to transpose data before loading (X <-> Y)
    startLineNr: Number,                    // 1 = first = default
    csvSeparationCharacter: String,         // CSV file column separator: comma or ;
    csvQuotCharacter: String,               // CSV values in "", in '' or without quotes
    webUrl: String,                         // URL for web connectors
    webTableIndex: String,                  // Index number (base 0) of table to load, else the Name of the table

    // Managed Connection, Connection created and managed outside of the DS
    connectionID: Number,                   // Connection to DB
    dataTableID: Number,                    // ID of table linked in DB
    businessGlossary: String,               // Detailed business oriented description of DS (non-technical)
    dataDictionary: String,                 // Detailed technical description of DS

    // Direct Connection, all info provided here and once off
    databaseName: String,                   // DB to connect to
    port: String,                           // Port on the DB Server
    serverType: String,                     // Server or Host type, ie MySQL, PostgreSQL, etc
    serverName: String,                     // Server or Host name
    dataTableName: String,                  // Table inside Server with the data
    dataSQLStatement: String,               // SQL Statement to extract data with
    dataNoSQLStatement: String,             // NoSQL Statement to extract data with
    dataNeo4jStatement: String,             // Cypher Statement to extract data with
    dataGraphQLStatement: String,           // GraphQL Statement to extract data with
    dataOverlaySpecification: Object,       // Overlay Specification to extract data with

    // Updated at runtime
    nrWidgets: Number,                      // Nr of Ws linked to this DS (at the moment)

    // Create and Edit info
    editor: String,                         // Last Edited By
    dateEdited: Date,                       // Last Edited On
    createMethod: String,                   // Method how DS was created, ie DirectFile, ..., ManagedSQLEditor
    createdBy: String,                      // Creator
    createdOn: {                            // Date task was created
        type: Date,
        // `Date.now()` returns the current unix timestamp as a Number,        default: Date.now
    }

});

// This pre-hook is called before the information is saved into the database
DatasourceSchema.pre('save', function(next) {
    var doc = this;

    // Find in the counters collection, increment and update
    counterModel.findOneAndUpdate(
        {_id: 'datasources.id'},
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
const DatasourceModel = mongoose.model('datasources', DatasourceSchema, 'datasources');

// Export
module.exports = DatasourceModel;