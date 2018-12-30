// Router for All Client data, ie XIS Trades, Sales History, etc

// Imports
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const debugData = require('debug')('app:data');

// Validate route
function validateRoute(course) {

    // TODO -validate resource = real route, ie dashboars, widgets, etc

	// Schema of what to validate
	const schema = {
		resource: Joi.string().min(3).required()
	};

	return Joi.validate(course, schema);
}

// Runs for ALL requests
router.use('/', (req, res, next) => {

    // Validate Params
    if (!req.params) {
        return res.status(400).json({
            "statusCode": "error",
            "message" : "Error: Resource not provided",
            "data": null,
            "error": "Error: Resource not provided"
        });
        return;
    };

    // Continue
    next();
})

// GET route
router.get('/', (req, res, next) => {

    // Load global var caching table - to be used later
    var dataCachingTable = require('../utils/dataCachingTableMemory');
    const localDataCachingTable = dataCachingTable.get();
    debugData('The localDataCachingTable.length: ', localDataCachingTable.length, req.params);

    // Extract: query, route (params without the :)
    const resource = req.params.resource.substring(1);
    const query = req.query;
    debugData('clientDataRouter.GET for resource:', resource, ', query:', query);
    debugData('');

    // Validate
    const { error } = validateRoute(req.params);
    if (error) {
        return res.status(400).json({
            "statusCode": "error",
            "message" : error.details[0].message,
            "data": null,
            "error": err
        });

        return;
    };

    // Try, in case model file does not exist
    try {
        // Get the model dynamically (take note of file spelling = resource)
        const canvasSchema = '../model/' + resource;
        debugData('Using Model ', canvasSchema)
        const canvasModel = require(canvasSchema);


        // Find the data (using the standard query JSON object)
        canvasModel.find( query, (err, docs) => {

            // Extract metodata from the Schema, using one document
            // const oneDoc = canvasModel.findOne();

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
                "message" : "Retrieved data for resource: " + resource,
                "data": docs,
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
            "message" : "No model file for resource: " + resource,
            "data": null,
            "error": error
        });
    };

})

// POST route
router.post('/', (req, res, next) => {

    // Extract: body, route (params without :)
    const resource = req.params.resource.substring(1);
    const body = req.body;
    debugData('clientDataRouter: POST for resource:', resource, 'body:', body)
    debugData('');

    // Try, in case model file does not exist
    try {
        // Get the model dynamically (take note of file spelling = resource)
        const canvasSchema = '../model/' + resource;
        const canvasModel = require(canvasSchema);

        // Create object and save to DB
        let canvasAdd = new canvasModel(body);
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
                    "message" : "Error: Could not add record for resource: " + resource,
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
            "message" : "No model file for resource: " + resource,
            "data": null,
            "error": error
        });
    };

});

// DELETE route
router.delete('/', (req, res, next) => {

    // Extract: body, route (params without :)
    const resource = req.params.resource.substring(1);

    const query = req.query;
    const id = req.query.id;

    debugData('clientDataRouter: DELETE for resource:', resource, 'body:', body, 'query:', query)
    debugData('');

    if (id == null) {
        return res.json({
            "statusCode": "failed",
            "message" : "Error: no ID provided for resource: " + resource + 'id: ', id,
            "data": null,
            "error": null
        });
    };

    // debugData('Router: DELETE for resource:', resource, 'query:', query);
    // debugData('');

    // Try, in case model file does not exist
    try {
        // Get the model dynamically (take note of file spelling = resource)
        const canvasSchema = '../model/' + resource;
        const canvasModel = require(canvasSchema);

        // Find and Delete from DB
        canvasModel.findOneAndRemove({id: id})
            .then(doc => {
                debugData('deleted', doc)

                if (doc == null) {
                    return res.json({
                        "statusCode": "error",
                        "message" : "Deletion of " + resource + " failed: could not find id = " + id,
                        "data": doc,
                        "error": null
                    });
                } else {
                    return res.json({
                        "statusCode": "success",
                        "message" : "Deleted record for resource: " + resource + ', id: ', id,
                        "data": doc,
                        "error": null
                    });
                };
            })
            .catch(err => {
                console.error(err)
                return res.json({
                    "statusCode": "error",
                    "message" : "Error: Could not delete record for resource: " + resource + ', id: ', id,
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
            "message" : "No model file for resource: " + resource,
            "data": null,
            "error": error
        });
    };

});

// PUT route
router.put('/', (req, res, next) => {

    // Extract: body, route (params without :)
    const resource = req.params.resource.substring(1);
    const query = req.query;
    const body = req.body;
    
    debugData('clientDataRouter: PUT for resource:', resource, 'body:', body, 'query:', query)
    debugData('');

    const id = req.query.id;
    if (id == null) {
        return res.json({
            "statusCode": "failed",
            "message" : "Error: no ID provided for resource: " + resource + 'id: ', id,
            "data": null,
            "error": null
        });
    };

    // debugData('Router: PUT for resource:', resource, 'query:', query, 'body:', body);
    // debugData('');

    // Try, in case model file does not exist
    try {
        // Get the model dynamically (take note of file spelling = resource)
        const canvasSchema = '../model/' + resource;
        const canvasModel = require(canvasSchema);

        // Find and Update DB
        canvasModel.findOneAndUpdate(
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
                    "message" : "Updated record for resource: " + resource + 'id: ', id,
                    "data": doc,
                    "error": null
                });
            })
            .catch(err => {
                console.error(err)
                return res.json({
                    "statusCode": "error",
                    "message" : "Error: Could not update record for resource: " + resource + 'id: ', id,
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
            "message" : "No model file for resource: " + resource,
            "data": null,
            "error": error
        });
    };

});

// Export
module.exports = router;