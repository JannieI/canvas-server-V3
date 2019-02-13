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

        // Count Dashboards
        const dashboardQuery = { id: req.query.id };
        dashboardModel.find(dashboardQuery).count( (err, numberDashboards) => {
            if (err) {
                return res.json(createErrorObject(
                    "error",
                    "Error retrieving Dashboard for ID: " + dashboardQuery,
                    err
                ));
            };
            
            // Count Dashboard Tabs
            const dashboardTabQuery = { dashboardID: req.query.id }
            dashboardTabModel.find(dashboardTabQuery).count( (err, numberDashboardTabs) => {

                if (err) {
                    return res.json(createErrorObject(
                        "error",
                        "Error retrieving Dashboard Tabs for ID: " + req.query.id,
                        err
                    ));
                };
        
                // Get Widgets
                const widgetQuery = { dashboardID: req.query.id }
                var widgetModelQuery = widgetModel
                    .find(dashboardTabQuery)
                    .select( { _id: -1, datasourceID: 1});

                widgetModelQuery.exec( (err, widgets) => {
                // widgetModel.find(dashboardTabQuery).select('datasourceID', (err, widgets) => {

                    if (err) {
                        return res.json(createErrorObject(
                            "error",
                            "Error retrieving Dashboard Tabs for ID: " + req.query.id,
                            err
                        ));
                    };

                    let numberDatasources = widgets.map(x => x.datasourceID);
                    numberDatasources = numberDatasources.filter(x => x != null);
                    numberDatasources = [...new Set(numberDatasources)];
                    console.log('xx widgetUniqueList', numberDatasources)

                    // Return the data with metadata
                        return res.json(
                            createReturnObject(
                                "success",
                                "Retrieved Summary for Dashboard ID: " + dashboardQuery,
                                { 
                                    dashboardID: id,
                                    numberDashboards: numberDashboards,
                                    numberDashboardTabs: numberDashboardTabs,
                                    numberWidgets: widgets.length,
                                    numberDatasources: numberDatasources.length
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
                    });
                });
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