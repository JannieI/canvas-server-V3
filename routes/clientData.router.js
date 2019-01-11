// Router for All Client data, ie XIS Trades, Sales History, etc

// Imports
const express = require('express');
const router = express.Router();
const debugData = require('debug')('app:data');
const debugDev = require('debug')('app:dev');

// Runs for ALL requests
router.use('/', (req, res, next) => {

    // Validate id of clientData provided
    const id = req.query.id;
    debugData('query is ', id);

	if (id == null) {
        return res.status(400).json({
            "statusCode": "error",
            "message" : "No id provided in query string",
            "data": null,
            "error": "No id provided in query string"
        });
    };

	if (isNaN(id)) {
        return res.status(400).json({
            "statusCode": "error",
            "message" : "id parameter must be a number",
            "data": null,
            "error": "id parameter must be a number"
        });
    };

    // Continue
    next();
})

// GET route
router.get('/', (req, res, next) => {

    // The structure of this route is as follows:
    // 1. Preparation: 
    //    1.1 Get the datasourceID from req.query
    //    1.2 Get the DS (Datasource) record for the given datasourceID in req.query.  
    //    1.3 Get auxilliary information, like Tr (Transformations), 
    //        dSet (datasets).
    // 2. Set results = [] (data block to return to Workstation)
    // 3. Get the data from Source (MySQL, etc):
    //     if cached and isFresh, result = cache
    //       Caching works the same as on Workstation: read the dataCachingTable (already loaded into
    //       memory), check if isCached and isFresh, and provide from Memory or Disc.  

    //       For now, all DS will be set to cache from Disc, since this is where the data is already stored.

    //     else call the correct data-layer-function depending on the DB type (ie MySQL or Mongo).
    //       The naming convention of the data-layer-function is databaseConnectors/DB.datalayer.js,
    //       where DB is the type of source (mysql, postgress, mssql, etc).  Inside each function,
    //       a number of METHOD are exported.  These are:
    //       select, insert, update, delete, or a special one.  The special methods can be:
    //         - listDatabases: lists all the databases on the given Database Server
    //         - listTables: takes as input the database name, and lists all tables in the SQL 
    //         - database, all the  collections in the Mongo database, all the worksheets in the 
    //           given Excel workbook, etc.
    //         - listFields: list all the columns for a given DB and SQL Table, Mongo Collection, Excel 
    //           worksheet, etc.  Not sure if this will contain metadata as well.
    //       Note, the case of the methods.  
    //       The data-layer-function is generic and has no DB specific info - all the DB info must
    //       be provided by the calling function.  It takes the following inputs:
    //       - DATABASE_OBJECT is required, and contains all the necessary information to connect to
    //         the source, including connection options.  Fields required for the different types of
    //         databases will vary.  Current fields are:
    //         Required:
    //           host: ie '127.0.0.1',
    //           user: ie 'janniei',
    //           password: ie psw,                        NOT sure how to handle this at moment
    //           database: ie 'mysql',
    //             
    //         Optional: 
    //           table name: ie XIS-Trades   
    //           mysql-connectionLimit 10,  
    //           mysql-supportBigNumbers true
    //       - TABLE is an optional string with the name of a SQL DB table, or equivalent.  For Mongo 
    //            it will be Collection, for files (Excel, CSV, etc that resiced on the Server) it 
    //            will be the full path (folder + filename), for Web tables it will be the URL, for
    //            services it will be the URL with options.  
    //       - FIELDS is an optional array of fields, ie [field1, field2] that must be extracted.
    //       - QUERY_STRING is an optional string that contains the SQL statement for a SQL database,
    //            Mongo Query, from:to rows and columns for Excel, etc.  
    //         Note that either TABLE (and optionally Fields) or QUERY_STRING must be provided.  The 
    //              data-layer-function will convert TABLE and FIELDS to a QUERY_STRING using the 
    //              relevant format for the given type of source data.
    //       - SQL_PARAMETERS is optional params for the ? in the SQL
    //       The data-layer-function has the following steps:
    //       - config database object, using DATABASE_OBJECT info provided
    //       - connects to database
    //       - queries, inserts, updates, deletes, special-methods the data
    //       - return the results (or error)

    //     Important point to solve: how does clientRouter get the DATABASE_OBJECT info:
    //     - from DS, from env params, from a connection table (each DS only has an ID to the )
    //     connection table, which has all the info (and maybe encoded passwords)
    
    //  Now, results = [data] from Source.

    // Two options on how to proceed:
    // 1. Load results into the Canvas.clientData collection.  The rational is this:
    // - it is easier to do the Transformations on Disc (and we can have seriously large datasets)
    // - it is easier to code the filter, sort using standard mongo instructions than Array
    // - then the ServerDisc caching is already done
    // Cons:
    // - performance will be slower as we have a write to DB, and 2nd Query !!!
    // - what if we are not allowed to store data on Disc (sensitive)
    // - may cause a bottleneck on the server ...
    // - still limited by Memory if a dataset is very large

    // 2. Manipulate the results in Memory:
    // - much, much faster
    // - performance hit on Server, and huge potential for bottleneck...

    // ?? Can be stream directly from MySQL into Mongo ... ??

    // 4. Do the Transformations according to the Tr loaded in step 1
    // 5. Decompose the query string in req.query into SORT_OBJECT, FIELDS_STRING, FILTER_OBJECT, 
    //    AGGREGATION_OBJECT
    // 6. If (SORT_OBJECT) then results = results.sort()
    // 7. If (FIELDS_STRING) then results = results[fields]
    // 8. If (FILTER_OBJECT) then results = results.filter()
    // 9. If (AGGREGATION_OBJECT) then results = results.clever-thing
    // 10. Add metadata, hopefully obtained directly from the source DB, or from the DS (if pre-stored), 
    //     with prudent defaults where unknown.
    // 11. Return results according to the CanvasHttpResponse interface
    // 12. If any error, return err according to the CanvasHttpResponse interface




    // 1. Preparation: 
    //    1.1 Get the datasourceID from req.query
    const reqQuery = req.query;
    const id = req.query.id;
    const datasourceID = req.query.datasourceID;
    
    //    1.2 Get the DS (Datasource) record for the given datasourceID in req.query.  
    const datasourceSchema = '../models/datasources.model';
    const datasourceModel = require(datasourceSchema);
   
    const mongoQuery = { id: datasourceID };
    
    // properties.find(searchParams).toArray(function (err, result) {
    datasourceModel.find( mongoQuery, (err, datasourceArray) => {
        if (err) {
            console.log('Error:', err)
            res.json({
                "statusCode": "error",
                "message" : "Error finding Datasource in Mongo DB",
                "data": null,
                "error": err
            });
            return;
        };
        if (datasourceArray.length != 1) {
            console.log('Error:', err)
            res.json({
                "statusCode": "error",
                "message" : "Expect EXACTLY one Datasource in Mongo DB, not " + datasourceArray.length,
                "data": null,
                "error": err
            });
            return;
        }
 
        // Get the DB-related vars
        const username = datasourceArray[0].username;
        const password = datasourceArray[0].password;
        const databaseName = datasourceArray[0].databaseName;
        const port = datasourceArray[0].port;
        const serverType = datasourceArray[0].serverType;
        const serverName = datasourceArray[0].serverName;
        const dataTableName = datasourceArray[0].dataTableName;
        const dataSQLStatement = datasourceArray[0].dataSQLStatement;
        debugDev('Properties read from DS', username, password, databaseName, port, serverType, serverName, dataTableName, dataSQLStatement, )
        
        
        //    1.3 Get auxilliary information, like Tr (Transformations), 
        //        dSet (datasets).

        // TODO later ...

        
        // 2. Set results = [] (data block to return to Workstation)
        let results = [];

        // 3. Get the data with ASYNC AWAIT:
        //    TODO - fix this later when we ready
        let useCachingDisc = true;
        let isFresh = true;



        // TODO - testing ....
        isFresh = false;     /// NB NB  TESTINgs herE ....




        
        //     if cached and isFresh, result = cache
        //       Caching works the same as on Workstation: read the dataCachingTable (already loaded into
        //       memory), check if isCached and isFresh, and provide from Memory or Disc.  
        if (useCachingDisc  &&  isFresh) {

            // Get the model
            const clientSchema = '../models/clientData.model';
            const clientModel = require(clientSchema);
            debugData('Using Schema clientData');

            // Find the data (using the standard query JSON object)
            clientModel.find( { id } , (err, docs) => {

                // Return the data with metadata
                return res.json({
                    "statusCode": "success",
                    "message" : "Retrieved data for id:" + id,
                    "data": docs[0].data,
                    "metaData": {
                        "table": {
                            "tableName": "", //oneDoc.mongooseCollection.collectionName,
                            "nrRecordsReturned":docs.length
                        },
                        "fields": []
                    },
                    "error": null
                });
            });
        } else {

            //     else call the correct data-layer-function depending on the DB type (ie MySQL or Mongo).

            // TODO - this must be done with separate routines per serverType
            if (serverType == 'PostgresSQL') {
                // Do thing here
            };
                if (serverType == 'Microsoft SQL') {
                // Do thing here
            };
            if (serverType == 'SQLite') {
                // Do thing here
            };
            if (serverType == 'Oracle') {
                // Do thing here
            };
            if (serverType == 'Mongo') {
                // Do thing here
            };
                
            if (serverType == 'MySQL') {
                const datalayer = require('../databaseConnectors/mysql.datalayer');
                // Inputs: DATABASE_OBJECT, TABLE, FIELDS, QUERY_STRING, SQL_PARAMETERS
                
                // Create databaseObject
                // Sample: databaseObject = { host: '127.0.0.1', user: 'janniei', password: 'janniei', database: 'mysql'}
                let databaseObject = 
                    { 
                        host: serverName, 
                        user: username, 
                        password: null,  // password !?? 
                        database: databaseName,
                        port: port==null?  3306  :  port
                    };
                debugDev('Prior to calling .select, databaseObject =',databaseObject)
                // TODO - do we use the serverName (in Workstation)    OR    host !??
                // TODO - what about parameters?  Must we cater for it !??

                const result = datalayer.select(databaseObject, dataTableName, null, dataSQLStatement, "janniei", )
                    .then(returnedData => {
                        results = returnedData;
                        console.log('Number of results:', results.length);



                        // Store the data in Canvas ClientData
                        // Get the model
                        const clientSchema = '../models/clientData.model';
                        const clientModel = require(clientSchema);
                        debugData('Using Schema clientData');

                        // Data to upsert
                        const dataToSave = {
                            id: datasourceID,
                            data: results
                        };

                        clientModel.update(
                            { id: datasourceID },
                            dataToSave, 
                            { upsert: true }, (err, res) => {
                                console.log('HERE !!!!!', res)
                                if(!err && !!res.upserted){
                                    // no document was found hence inserted
                                }else if(!err && !res.upserted){
                                    // already existing
                                }else{
                                    //  something wicked happend
                                }
                        });
                
                        //     Now, results = [data]
                        // 4. Do the Transformations according to the Tr loaded in step 1
                        // 5. Decompose the query string in req.query into SORT_OBJECT, FIELDS_STRING, FILTER_OBJECT, 
                        //    AGGREGATION_OBJECT
                        const sortObject = req.query.sortObject;
                        const fields = req.query.fields;
                        const filterObject = req.query.filterObject;
                        const aggregationObject = req.query.aggregationObject;

                        let sort = JSON.parse(sortObject)
                        console.log('rest', sortObject, fields, filterObject, aggregationObject)
                        console.log('sortObject', sort)



                        // 6. If (SORT_OBJECT) then results = results.sort()
                        



                        // 7. If (FIELDS_STRING) then results = results[fields]
                        // 8. If (FILTER_OBJECT) then results = results.filter()
                        // 9. If (AGGREGATION_OBJECT) then results = results.clever-thing
                        // 10. Add metadata, hopefully obtained directly from the source DB, or from the DS (if pre-stored), 
                        //     with prudent defaults where unknown.
                        // 11. Return results according to the CanvasHttpResponse interface
                        // 12. If any error, return err according to the CanvasHttpResponse interface


                        res.json(results);
                        return;

                    })
                    .catch(err =>{
                        console.log('Err after .select in router', err);
                    });
            };
        };
    });


    // KEEP !!!  
    // This is the code to get /data?id=x from the Mongo data  ~  Disc Caching.
    // It works !!!
    //
    // Try, in case model file does not exist
    // try {
    //     // Get the model
    //     const clientSchema = '../model.model/clientData.model';
    //     const clientModel = require(clientSchema);
    //     debugData('Using Schema clientData');

    //     // Find the data (using the standard query JSON object)
    //     clientModel.find( reqQuery, (err, docs) => {

    //         // Extract metodata from the Schema, using one document
    //         // const oneDoc = clientModel.findOne();

    //         // Empty Array of fields
    //         var fields = [];

    //         // Loop on metatdata
    //         // for (var key in oneDoc.schema.obj) {
    //         //     var value = oneDoc.schema.obj[key];

    //         //     fields.push(
    //         //         {
    //         //             "fieldName": key,
    //         //             "fieldType": value.name,
    //         //             "average": null,
    //         //             "max": null,
    //         //             "median": null,
    //         //             "min": null,
    //         //             "sum": null
    //         //         }
    //         //     );
    //         // };

    //         // console.log('xx COUNT', fields, oneDoc.mongooseCollection.collectionName, docs.length)
    //         // Return the data with metadata
    //         return res.json({
    //             "statusCode": "success",
    //             "message" : "Retrieved data for id:" + id,
    //             "data": docs[0].data,
    //             "metaData": {
    //                 "table": {
    //                     "tableName": "", //oneDoc.mongooseCollection.collectionName,
    //                     "nrRecordsReturned":docs.length
    //                 },
    //                 "fields": fields
    //             },
    //             "error": null
    //         });
    //     });
    // }
    // catch (error) {
    //     return res.status(400).json({
    //         "statusCode": "error",
    //         "message" : "Model clientData does not exist, or contains errors",
    //         "data": null,
    //         "error": error
    //     });
    // };

})

// POST route
router.post('/', (req, res, next) => {

    // Extract: body, route (params without :)
    const body = req.body;
    const query = req.query;
    const id = req.query.id;
    debugData('clientDataRouter: POST for id:', id, 'body:', body)
    debugData('');

    // Try, in case model file does not exist
    try {
        // Get the model
        const clientSchema = '../models/clientData.model';
        const clientModel = require(clientSchema);
        debugData('Using Schema clientData');

        // Create object and save to DB
        let canvasAdd = new clientModel(body);
        canvasAdd.save()
            .then(doc => {
                debugData('saved', doc)
                return res.json({
                    "statusCode": "success",
                    "message" : "Added record for resource: " + resource,
                    "data": doc,
                    "error": null
                });
            })
            .catch(err => {
                console.error(err)
                return res.json({
                    "statusCode": "error",
                    "message" : "Error: Could not add record for id:", id,
                    "data": null,
                    "error":
                        {
                            "errorObject": err
                        }
                });
        });
    }
    catch (error) {
        return res.status(400).json({
            "statusCode": "error",
            "message" : "No model file for id:", id,
            "data": null,
            "error": error
        });
    };

});

// DELETE route
router.delete('/', (req, res, next) => {

    // Extract: body, route (params without :)
    const query = req.query;
    const id = req.query.id;

    debugData('clientDataRouter: DELETE for id:', id, 'body:', body, 'query:', query)
    debugData('');

    if (id == null) {
        return res.json({
            "statusCode": "failed",
            "message" : "Error: no id provided:" + id,
            "data": null,
            "error": null
        });
    };

    // Try, in case model file does not exist
    try {
        // Get the model
        const clientSchema = '../models/clientData.model';
        const clientModel = require(clientSchema);
        debugData('Using Schema clientData');

        // Find and Delete from DB
        clientModel.findOneAndRemove({id: id})
            .then(doc => {
                debugData('deleted', doc)

                if (doc == null) {
                    return res.json({
                        "statusCode": "error",
                        "message" : "Deletion of data failed: could not find id = " + id,
                        "data": doc,
                        "error": null
                    });
                } else {
                    return res.json({
                        "statusCode": "success",
                        "message" : "Deleted record for id:" + id,
                        "data": doc,
                        "error": null
                    });
                };
            })
            .catch(err => {
                console.error(err)
                return res.json({
                    "statusCode": "error",
                    "message" : "Error: Could not delete record for id:" + id ,
                    "data": null,
                    "error":
                        {
                            "errorObject": err
                        }
                });
        });
    }
    catch (error) {
        return res.status(400).json({
            "statusCode": "error",
            "message" : "No model file for id:", id,
            "data": null,
            "error": error
        });
    };

});

// PUT route
router.put('/', (req, res, next) => {

    // Extract: body, route (params without :)
    const resource = req.params.resource.substring(1);
    const body = req.body;
    const query = req.query;
    const id = req.query.id;

    debugData('clientDataRouter: PUT for id:', id, 'body:', body, 'query:', query)
    debugData('');

    // Try, in case model file does not exist
    try {
        // Get the model
        const clientSchema = '../models/clientData.model';
        const clientModel = require(clientSchema);
        debugData('Using Schema clientData');

        // Find and Update DB
        clientModel.findOneAndUpdate(
            {id: id},
            body,
            {
              new: true,                       // return updated doc
              runValidators: true              // validate before update
            })
            .then(doc => {
                debugData('updated', doc)
                return res.json({
                    "statusCode": "success",
                    "message" : "Updated record for id:", id,
                    "data": doc,
                    "error": null
                });
            })
            .catch(err => {
                console.error(err)
                return res.json({
                    "statusCode": "error",
                    "message" : "Error: Could not update record for id:", id,
                    "data": null,
                    "error":
                        {
                            "errorObject": err
                        }
                });
        });
    }
    catch (error) {
        return res.status(400).json({
            "statusCode": "error",
            "message" : "No model file for id:", id,
            "data": null,
            "error": error
        });
    };

});

// Export
module.exports = router;