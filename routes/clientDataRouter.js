// Router for All Client data, ie XIS Trades, Sales History, etc

// Imports
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const debugData = require('debug')('app:data');

// Runs for ALL requests
router.use('/', (req, res, next) => {

    // Validate datasourceID
    const datasourceID = req.query.datasourceID;
    debugData('query is ', datasourceID);

	if (datasourceID == null) {
        return res.status(400).json({
            "statusCode": "error",
            "message" : "No datasourceID provided in query string",
            "data": null,
            "error": "No datasourceID provided in query string"
        });
    };

	if (isNaN(datasourceID)) {
        return res.status(400).json({
            "statusCode": "error",
            "message" : "datasourceID must be a number",
            "data": null,
            "error": "datasourceID must be a number"
        });
    };

    // Continue
    next();
})

// GET route
router.get('/', (req, res, next) => {

    // Extract: query, route (params without the :)
    const query = req.query;
    const datasourceID = req.query.datasourceID;

    debugData('clientDataRouter.GET for datasourceID:', datasourceID, ', query:', query);
    debugData('');

    // Try, in case model file does not exist
    try {
        // Get the model
        const clientSchema = '../model/clientData';
        const clientModel = require(clientSchema);
        debugData('Using Schema clientData');


        // Find the data (using the standard query JSON object)
        clientModel.find( query, (err, docs) => {

            // Extract metodata from the Schema, using one document
            // const oneDoc = clientModel.findOne();

            // Empty Array of fields
            var fields = [];

            // Loop on metatdata
            // for (var key in oneDoc.schema.obj) {
            //     var value = oneDoc.schema.obj[key];

            //     fields.push(
            //         {
            //             "fieldName": key,
            //             "fieldType": value.name,
            //             "average": null,
            //             "max": null,
            //             "median": null,
            //             "min": null,
            //             "sum": null
            //         }
            //     );
            // };

            // console.log('xx COUNT', fields, oneDoc.mongooseCollection.collectionName, docs.length)
            // Return the data with metadata
            return res.json({
                "statusCode": "success",
                "message" : "Retrieved data for datasourceID:", datasourceID,
                "data": docs.data,
                "metaData": {
                    "table": {
                        "tableName": "", //oneDoc.mongooseCollection.collectionName,
                        "nrRecordsReturned":docs.length
                    },
                    "fields": fields
                },
                "error": null
            });
        });
    }
    catch (error) {
        return res.status(400).json({
            "statusCode": "error",
            "message" : "Model clientData does not exist",
            "data": null,
            "error": error
        });
    };

})

// POST route
router.post('/', (req, res, next) => {

    // Extract: body, route (params without :)
    const body = req.body;
    const query = req.query;
    const datasourceID = req.query.datasourceID;
    debugData('clientDataRouter: POST for datasourceID:', datasourceID, 'body:', body)
    debugData('');

    // Try, in case model file does not exist
    try {
        // Get the model
        const clientSchema = '../model/clientData';
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
                    "message" : "Error: Could not add record for datasourceID:", datasourceID,
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
            "message" : "No model file for datasourceID:", datasourceID,
            "data": null,
            "error": error
        });
    };

});

// DELETE route
router.delete('/', (req, res, next) => {

    // Extract: body, route (params without :)
    const query = req.query;
    const datasourceID = req.query.datasourceID;

    debugData('clientDataRouter: DELETE for datasourceID:', datasourceID, 'body:', body, 'query:', query)
    debugData('');

    if (id == null) {
        return res.json({
            "statusCode": "failed",
            "message" : "Error: no datasourceID provided:" + datasourceID,
            "data": null,
            "error": null
        });
    };

    // Try, in case model file does not exist
    try {
        // Get the model
        const clientSchema = '../model/clientData';
        const clientModel = require(clientSchema);
        debugData('Using Schema clientData');

        // Find and Delete from DB
        clientModel.findOneAndRemove({datasourceID: datasourceID})
            .then(doc => {
                debugData('deleted', doc)

                if (doc == null) {
                    return res.json({
                        "statusCode": "error",
                        "message" : "Deletion of data failed: could not find datasourceID = " + datasourceID,
                        "data": doc,
                        "error": null
                    });
                } else {
                    return res.json({
                        "statusCode": "success",
                        "message" : "Deleted record for datasourceID:" + datasourceID,
                        "data": doc,
                        "error": null
                    });
                };
            })
            .catch(err => {
                console.error(err)
                return res.json({
                    "statusCode": "error",
                    "message" : "Error: Could not delete record for datasourceID:" + datasourceID ,
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
            "message" : "No model file for datasourceID:", datasourceID,
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
    const datasourceID = req.query.datasourceID;
    
    debugData('clientDataRouter: PUT for datasourceID:', datasourceID, 'body:', body, 'query:', query)
    debugData('');

    // Try, in case model file does not exist
    try {
        // Get the model
        const clientSchema = '../model/clientData';
        const clientModel = require(clientSchema);
        debugData('Using Schema clientData');

        // Find and Update DB
        clientModel.findOneAndUpdate(
            {datasourceID: datasourceID},
            body,
            {
              new: true,                       // return updated doc
              runValidators: true              // validate before update
            })
            .then(doc => {
                debugData('updated', doc)
                return res.json({
                    "statusCode": "success",
                    "message" : "Updated record for datasourceID:", datasourceID,
                    "data": doc,
                    "error": null
                });
            })
            .catch(err => {
                console.error(err)
                return res.json({
                    "statusCode": "error",
                    "message" : "Error: Could not update record for datasourceID:", datasourceID,
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
            "message" : "No model file for datasourceID:", datasourceID,
            "data": null,
            "error": error
        });
    };

});

// Export
module.exports = router;