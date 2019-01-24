// Router for Current Canvas Dashboard, with all required info for Widgets, etc

// Imports
const express = require('express');
const router = express.Router();
const debugDev = require('debug')('app:dev');
const createErrorObject = require('../utils/createErrorObject.util');
const createReturnObject = require('../utils/createReturnObject.util');
const dashboardSchema = '../models/dashboards.model';
const widgetSchema = '../models/widgets.model';


// GET route
router.get('/', (req, res, next) => {

    const query = { id: req.query.id };

    debugDev('## --------------------------');
    debugDev('## GET Starting with CurrentDashboard with query:', query);

    // Try, in case model file does not exist
    try {
        // Get the model dynamically (take note of file spelling = resource)
        const dashboardModel = require(dashboardSchema);
        const widgetModel = require(widgetSchema);

        // Find the data (using the standard query JSON object)
        dashboardModel.find( query, (err, dashboards) => {

            if (err) {
                return res.json(createErrorObject(
                    "error",
                    "Error retrieving Dashboard for ID: " + req.query.id,
                    err
                ));
            };

            // Return the data with metadata
            return res.json(
                createReturnObject(
                    "success",
                    "Retrieved data for Current Dashboard ID: " + req.query.id,
                    dashboards,
                    null,
                    null,
                    null,
                    null,
                    null,
                    dashboards.length,
                    null,
                    null
                    )
            );
        });
    }
    catch (error) {
        debugDev('Error in canvasCurrentDashboard.router', error.message)
        return res.status(400).json({
            "statusCode": "error",
            "message" : "Error retrieving Current Dashboard ID: " + req.query.id,
            "data": null,
            "error": error
        });
    };

})

// Export
module.exports = router;