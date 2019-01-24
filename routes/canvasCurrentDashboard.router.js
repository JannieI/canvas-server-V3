// Router for Current Canvas Dashboard, with all required info for Widgets, etc

// Imports
const express = require('express');
const router = express.Router();
const debugDev = require('debug')('app:dev');
const createErrorObject = require('../utils/createErrorObject.util');
const createReturnObject = require('../utils/createReturnObject.util');
const dashboardSchema = '../models/dashboards.model';
const dashboardTabSchema = '../models/dashboardTabs.model';
const widgetSchema = '../models/widgets.model';
const datasourceSchema = '../models/datasources.model';

// GET route
router.get('/', (req, res, next) => {

    const dashboardQuery = { id: req.query.id };
    const dashboardTabQuery = { dashboardID: req.query.id }
    const widgetQuery = { dashboardID: req.query.id }
    const datasourceQuery = { dashboardID: req.query.id }
    const datasourceIDexclude = req.query.datasourceIDexclude;

    // Get Array of Datasource IDs to exclude.  This is an optional parameter from Workstation
    // and used in case it already has some Datasources (ie from a previous Tab)
    let datasourceIDexcludeArray = [];
    if (datasourceIDexclude != null) {
        datasourceIDexcludeArray = datasourceIDexclude.split(",");
        for (var i = 0; i < datasourceIDexcludeArray.length; i++) {
            datasourceIDexcludeArray[i] = +datasourceIDexcludeArray[i];
        };
    };

    debugDev('## --------------------------');
    debugDev('## GET Starting with CurrentDashboard with query:', dashboardQuery, widgetQuery);
    
    // Try, in case model file does not exist
    try {
        // Get the model dynamically (take note of file spelling = resource)
        const dashboardModel = require(dashboardSchema);
        const dashboardTabModel = require(dashboardTabSchema);
        const widgetModel = require(widgetSchema);
        const datasourceModel = require(datasourceSchema);
        
        // Find Dashboard
        dashboardModel.find( dashboardQuery, (err, dashboards) => {

            if (err) {
                return res.json(createErrorObject(
                    "error",
                    "Error retrieving Dashboard for ID: " + req.query.id,
                    err
                ));
            };
                
            // Find Dashboard Tabs
            dashboardTabModel.find( widgetQuery, (err, dashboardTabs) => {

                if (err) {
                    return res.json(createErrorObject(
                        "error",
                        "Error retrieving Widgets for ID: " + req.query.id,
                        err
                    ));
                };
        
                // Find Widgets
                widgetModel.find( dashboardTabQuery, (err, widgets) => {

                    if (err) {
                        return res.json(createErrorObject(
                            "error",
                            "Error retrieving Dashboard Tabs for ID: " + req.query.id,
                            err
                        ));
                    };
                    if (widgets == null) { 
                        widgets = [];
                    };
                    let datasourceIDincludeArray = [];
                    for (var i = 0; i < widgets.length; i++) {

                        // Exclude Shapes that does not use Datasources
                        if (widgets[i].datasourceID != null) {
                            datasourceIDincludeArray.push(widgets[i].datasourceID)
                        };
                    };
    console.log('xx', datasourceIDincludeArray, datasourceIDexcludeArray)
                
                    // PersonModel.find({ favouriteFoods: { "$in" : ["sushi"]} }, ...);
                            // Return the data with metadata
                            return res.json(
                                createReturnObject(
                                    "success",
                                    "Retrieved data for Current Dashboard ID: " + req.query.id,
                                    { 
                                        dashboards: dashboards,
                                        dashboardTabs: dashboardTabs,
                                        widgets: widgets.length
                                    },
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
            });
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