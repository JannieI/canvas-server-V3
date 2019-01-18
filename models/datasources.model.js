// Model for datasources collection
  
// Imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const counterModel = require('./counters.model')

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

const DatasourceCombinationSpec = new Schema({
    lefthandDatasourceID: Number,           // Joins LH to RH, identification of LH Datasource
    lefthandDatasourceField: String,        // LH Datasource field name
    joinType: String,                       // LeftJoin, InnerJoin, RightJoin, Union, Minus, Intersection, etc
    righthandDatasourceID: Number,          // Joins LH to RH, identification of RH Datasource
    righthandDatasourceField: String,       // RH Datasource field name

})

const MetaDataFields = new Schema({
    fieldName: String,                      // Name of the field
    fieldAlias: String,                     // Optional Alias (ie SELECT TNX as Transaction) 
    fieldType: String,                      // Type: string, number, boolean, Array
    length: String,                         // Maximum length of the field
    average: String,                        // Optional stats: average in Field
    max: String,                            // Optional stats: Maximum in Field
    median: String,                         // Optional stats: Median in Field
    min: String,                            // Optional stats: Minimum value in Field
    sum: String,                            // Optional stats: Sum of all values (ie SQL SUM() )
})


// Schema
const DatasourceSchema = new Schema({

    // WHO

    // Who: Descriptive info
    id: Number,                             // Unique record ID
    type: String,                           // Type of source, ie File, Server, Web, Service
    subType: String,                        // Subtype, ie Excel/ CSV for File, PostgreSQL/ Mongo for Server
    typeVersion: String,                    // Version of source, ie Excel 2016
    name: String,                           // Name of Datasource
    description: String,                    // Description of the DS

    //  Who: Access Type
    accessType: String,                     // How to access D: Private, Public, AccessList

    //  Who: Create and Edit info
    createMethod: String,                   // Method how DS was created, ie DirectFile, ..., ManagedSQLEditor
    editor: String,                         // Last Edited By
    dateEdited: Date,                       // Last Edited On
    createdBy: String,                      // Creator
    createdOn: {                            // Date task was created
        type: Date,
        // `Date.now()` returns the current unix timestamp as a Number,        default: Date.now
    },


    // WHERE

    // Where: Optional Combinations (then NO other WHERE info provided)
    datasourceCombinationSpec: DatasourceCombinationSpec,   // If this DS is a combination of 2 others

    // Where: External Limits
    rowLimitFromSource: Number,             // Maximum nr rows to return (ie SQL ... LIMIT n), 0 means all
    timeoutLimitSeconds: Number,            // Timeout (ie for Databases) in seconds, 0 means no limit
     
    // Where: External Location for Files
    folder: String,                         // Folder from which the data was loaded
    fileName: String,                       // Filename from which the data was loaded
    excelWorksheet: String,                 // Excel Worksheet name from which the data was loaded
    transposeOnLoad: Boolean,               // True to transpose data before loading (X <-> Y)
    startLineNr: Number,                    // 1 = first = default
    endLineNr: Number,                      // 2 = second line (NB: base 1).  0 = all lines with data
    startColumnNr: Number,                  // 1 = first = default
    endColumnNr: Number,                    // 2 = second line (NB: base 1).  0 = all columns with data
    csvSeparationCharacter: String,         // CSV file column separator: comma or ;
    csvQuotCharacter: String,               // CSV values in "", in '' or without quotes
    encoding: String,                       // Optional: Ascii, Edcdic (mainframe)

    // Where: External location of web pages
    webUrl: String,                         // URL for web connectors
    webTableIndex: String,                  // Index number (base 0) of table to load, else the Name of the table

    // Where: External location of services
    serviceUrl: String,                     // URL of REST service
    serviceParams: String,                  // REST parameters (: Express req object)
    serviceQueryParams: String,             // REST query parameters (? Express req object)
    serviceHeaders: String,                 // REST optional headers 

    // Where: Location of Managed Connection, Connection created and managed outside of the DS
    connectionID: Number,                   // Connection to DB
    dataTableID: Number,                    // ID of table linked in DB

    // Where: External location for Direct Connection (not using a Managed Connection)
    serverType: String,                     // Server or Host type, ie MySQL, PostgreSQL, etc
    serverName: String,                     // Server or Host name
    databaseName: String,                   // DB to connect to
    port: String,                           // Port on the DB Server
    username: String,                       // Username to log into server (if not via AD)
    password: String,                       // Password to log into server
    dataTableName: String,                  // Table inside Server with the data
    dataSQLStatement: String,               // SQL Statement to extract data with
    dataNoSQLStatement: String,             // NoSQL Statement to extract data with
    dataNeo4jStatement: String,             // Cypher Statement to extract data with
    dataGraphQLStatement: String,           // GraphQL Statement to extract data with
    dataOverlaySpecification: Object,       // Overlay Specification to extract data with

    // Where: Updated at runtime
    nrWidgets: Number,                      // Nr of Ws linked to this DS (at the moment)

    // Where: External location on client / external Source
    sourceIsAccessable: Boolean,            // True if Source can be read again.  False for browser uploaded files    
    
    // Where: External Parameters (used for the external queries)
    queryParameters: String,                // SQL Paramters, Mongo Parameters
    
    // Where: Internal location on Canvas Server / Caching info
    // Note: for now, clientData is not cached in Server or Workstation Memory
    cacheResultsOnServer: Boolean,          // True if results may be cached on server. Each Tr is decided separately
    serverExpiryDateTime: Date,             // When cache expires on server
    unRefreshable: Boolean,                 // Can create once, but cannot Refresh after that
    cacheResultsLocal: Boolean,             // True if Local results must be cached

    // Where: Optional Internal Max Oldness allowed - must be fresher than given
    oldnessMaxPeriodInterval: String,       // Ie. second, minute, hour, day, month, year
    oldnessMaxPeriodUnits: Number,          // Must be fresher than say 8 hour
    oldnessRelatedDate: String,             // Ie. today, yesterday, previousWorkingDay, weekStart, monthStart, yearStart
    oldnessRelatedTime: String,             // Ie. '08:00' - must be fresher than today 8:00

    // Where: Internal Refresh info
    refreshedBy: String,                    // Last UserID that refreshed this datasource
    refreshedServerOn: Date,                // Last dateTime this DS was refreshed on Server
    refreshedLocalOn: Date,                 // Last dateTime this DS was refreshed locally
 

    // WHAT

	// What: Dashboard-applicable Filters
    datasourceFilters: [ DatasourceFilter ],    // Optional Array of DS-Filters per Dashboard
    datasourceFilterForThisDashboard: Boolean,  // @ RunTime, changes: true if THIS D has filters on THIS DS

    // What: MetaData (describes the What)

    dataFieldIDs: [ { type: Number } ],     // IDs of fields in DB table
    dataFields: [ { type: String } ],       // FieldNames, in order to display
    dataFieldTypes: [ { type: String } ],   // Field Types, same order as dataFields
    dataFieldLengths: [ { type: Number } ], // Max field lengths, same order as dataFields
    metaDataField: [ MetaDataFields ],      // Optional: MetaData for Fields (many not be fully populated)
    businessGlossary: String,               // Detailed business oriented description of DS (non-technical)
    dataDictionary: String,                 // Detailed technical description of DS

    // What: Transformations (manipulations of the What)
    transformations: [ DatasourceTransformation ],  // Optional array of transformations done to this Datasource

    // What: Calculated at run-time
    dataErrorMessage: String,               // Error returned by Canvas Server
    nrRecordsReturned: Number,              // Nr of records returned by Canvas Server
    sourceLocation: String,                 // Source, CanvasCacheDisc, CanvasCacheMemory



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