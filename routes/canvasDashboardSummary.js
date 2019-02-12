// Router to return summary info on a Dashboard, ie number of Widgets, number of tags, etc

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

    const startPos = module.id.lastIndexOf("/");
    if (startPos > 0  &&  startPos < module.id.length) {
        moduleName = module.id.substring(startPos + 1);
    };
    const id = req.query.id;

    debugDev(moduleName + ": " + '## --------------------------');
    debugDev(moduleName + ": " + '## GET Starting with Dashboard Summary with dashboard id:', id);
    
    // Try, in case model file does not exist
    // try {
        // Get the model dynamically (take note of file spelling = resource)
        const dashboardModel = require(dashboardSchema);
        const dashboardTabModel = require(dashboardTabSchema);
        const widgetModel = require(widgetSchema);
        const datasourceModel = require(datasourceSchema);

        let numberWidgets = null;

        // Find Dashboard
        const dashboardQuery = { id: req.query.id };
        dashboardModel.find(dashboardQuery).count( (err, x) => {
            if (err) {
                return res.json(createErrorObject(
                    "error",
                    "Error retrieving Dashboard for ID: " + dashboardQuery,
                    err
                ));
            };
            
            numberWidgets = x;

            // Find Dashboard Tabs
            // const dashboardTabQuery = { dashboardID: req.query.id }
            // dashboardTabModel.find( dashboardTabQuery, (err, dashboardTabs) => {

            //     if (err) {
            //         return res.json(createErrorObject(
            //             "error",
            //             "Error retrieving Widgets for ID: " + req.query.id,
            //             err
            //         ));
            //     };
        
            //     // Find Widgets
            //     const widgetQuery = { dashboardID: req.query.id }
            //     widgetModel.find( dashboardTabQuery, (err, widgets) => {

            //         if (err) {
            //             return res.json(createErrorObject(
            //                 "error",
            //                 "Error retrieving Dashboard Tabs for ID: " + req.query.id,
            //                 err
            //             ));
            //         };
            //         if (widgets == null) { 
            //             widgets = [];
            //         };

            //         // Load an Array of Datasource IDs in use by the Widgets on this Tab
            //         let datasourceIDincludeArray = [];
            //         for (var i = 0; i < widgets.length; i++) {

            //             // Exclude Shapes that does not use Datasources
            //             if (widgets[i].datasourceID != null) {
            //                 if (datasourceIDincludeArray.indexOf(widgets[i].datasourceID) < 0) {
            //                     datasourceIDincludeArray.push(widgets[i].datasourceID)
            //                 };
            //             };
            //         };
            //         console.log('xx datasourceIDincludeArray', datasourceIDincludeArray)

            //         // Get Array of Datasource IDs to exclude.  This is an optional parameter from Workstation
            //         // and used in case it already has some Datasources (ie from a previous Tab)
            //         const datasourceIDexclude = req.query.datasourceIDexclude;
            //         let datasourceIDexcludeArray = [];
            //         if (datasourceIDexclude != null) {
            //             datasourceIDexcludeArray = datasourceIDexclude.split(",");
            //             for (var i = 0; i < datasourceIDexcludeArray.length; i++) {
            //                 datasourceIDexcludeArray[i] = +datasourceIDexcludeArray[i];
            //             };
            //         };

            //         // Exclude requested Datasource IDs
            //         if (datasourceIDexcludeArray.length > 0) {
            //             datasourceIDincludeArray = datasourceIDincludeArray
            //                 .filter(x => datasourceIDexcludeArray.indexOf(x) < 0);
            //         };

            //         // Create query object to filter on
            //         let datasourceQuery = { 
            //             id: { "$in": datasourceIDincludeArray }
            //         }
            //         console.log('xx datasourceQuery', datasourceQuery)
                 
            //         datasourceModel.find( datasourceQuery, (err, datasources) => {

            //             if (err) {
            //                 return res.json(createErrorObject(
            //                     "error",
            //                     "Error retrieving Datasource for ID: " + req.query.id,
            //                     err
            //                 ));
            //             };
            //             if (datasources == null) { 
            //                 datasources = [];
            //             };

                    // Return the data with metadata
                        return res.json(
                            createReturnObject(
                                "success",
                                "Retrieved Summary for Dashboard ID: " + dashboardQuery,
                                { 
                                    dashboardID: id,
                                    numberWidgets: numberWidgets
                                },
                                null,
                                null,
                                null,
                                null,
                                null,
                                1,
                                null,
                                null
                                )
                        );
            //         });
            //     });
            // });
        });
    // }
    // catch (error) {
    //     debugDev(moduleName + ": " + 'Error in canvasDashboardSummary.router', error.message)
    //     return res.status(400).json({
    //         "statusCode": "error",
    //         "message" : "Error retrieving Current Dashboard ID: " + req.query.id,
    //         "data": null,
    //         "error": error
    //     });
    // };

})

// Export
module.exports = router;