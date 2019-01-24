// Router for Current Canvas Dashboard, with all required info for Widgets, etc

// Imports
const express = require('express');
const router = express.Router();
const config = require('config');
const debugDev = require('debug')('app:dev');
const createErrorObject = require('../utils/createErrorObject.util');
const createReturnObject = require('../utils/createReturnObject.util');


// GET route
router.get('/', (req, res, next) => {

    const query = { id: req.query.id };

    debugDev('## --------------------------');
    debugDev('## GET Starting with CurrentDashboard with query:', query);

    // Try, in case model file does not exist
    try {
        // Get the model dynamically (take note of file spelling = resource)
        const canvasSchema = '../models/dashboards.model';
        const canvasModel = require(canvasSchema);

        // Find the data (using the standard query JSON object)
        canvasModel.find( query, (err, docs) => {

            // KEEP for later !
            // Extract metodata from the Schema, using one document
            // const oneDoc = canvasModel.findOne();


            // Empty Array of fields
            var fields = [];

            // console.log('xx COUNT', fields, oneDoc.mongooseCollection.collectionName, docs.length)
            // Return the data with metadata
            return res.json(
                createReturnObject(
                    "success",
                    "Retrieved data for Current Dashboard ID: " + req.query.id,
                    docs,
                    null,
                    null,
                    null,
                    null,
                    null,
                    docs.length,
                    fields,
                    null
                    )
            );
        });
    }
    catch (error) {
        console.log('WHY ?', error.message)
        return res.status(400).json({
            "statusCode": "error",
            "message" : "No model file for Current Dashboard ID: " + req.query.id,
            "data": null,
            "error": error
        });
    };

})

// Export
module.exports = router;