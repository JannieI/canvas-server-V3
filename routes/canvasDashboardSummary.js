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
const dashboardSnapshotSchema = '../models/dashboardSnapshots.model';
const canvasMessageSchema = '../models/canvasMessages.model';
const canvasCommentSchema = '../models/canvasComments.model';
const dashboardScheduleSchema = '../models/dashboardSchedules.model';
const dashboardSubscriptionSchema = '../models/dashboardSubscriptions.model';
const DashboardTagSchema = '../models/dashboardTags.model';
const dashboardPermissionSchema = '../models/dashboardPermissions.model';
const widgetCheckpointSchema = '../models/widgetCheckpoints.model';

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
        const dashboardSnapshotModel = require(dashboardSnapshotSchema);
        const canvasMessageModel = require(canvasMessageSchema);
        const canvasCommentModel = require(canvasCommentSchema);
        const dashboardScheduleModel = require(dashboardScheduleSchema);
        const dashboardSubscriptionModel = require(dashboardSubscriptionSchema);
        const dashboardTagModel = require(DashboardTagSchema);
        const dashboardPermissionModel = require(dashboardPermissionSchema);
        const widgetCheckpointModel = require(widgetCheckpointSchema);

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
            const dashboardIDQuery = { dashboardID: req.query.id };
            dashboardTabModel.find(dashboardIDQuery).count( (err, numberDashboardTabs) => {
                if (err) {
                    return res.json(createErrorObject(
                        "error",
                        "Error retrieving Dashboard Tabs for ID: " + req.query.id,
                        err
                    ));
                };
        
                // Get Widgets
                var widgetModelQuery = widgetModel
                    .find(dashboardIDQuery)
                    .select( { _id: -1, datasourceID: 1});

                widgetModelQuery.exec( (err, widgets) => {
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
                  
                    // Count DashboardSnapshots
                    dashboardSnapshotModel.find(dashboardIDQuery).count( (err, numberDashboardSnapshots) => {
                        if (err) {
                            return res.json(createErrorObject(
                                "error",
                                "Error retrieving DashboardSnapshots for ID: " + req.query.id,
                                err
                            ));
                        };
                  
                        // Count CanvasMessages
                        canvasCommentModel.find(dashboardIDQuery).count( (err, numberCanvasMessages) => {
                            if (err) {
                                return res.json(createErrorObject(
                                    "error",
                                    "Error retrieving CanvasMessages for ID: " + req.query.id,
                                    err
                                ));
                            };
                    
                            // Count CanvasComments
                            canvasCommentModel.find(dashboardIDQuery).count( (err, numberCanvasComments) => {
                                if (err) {
                                    return res.json(createErrorObject(
                                        "error",
                                        "Error retrieving CanvasComments for ID: " + req.query.id,
                                        err
                                    ));
                                };
                        
                                // Count DashboardSchedules
                                dashboardScheduleModel.find(dashboardIDQuery).count( (err, numberdashboardSchedules) => {
                                    if (err) {
                                        return res.json(createErrorObject(
                                            "error",
                                            "Error retrieving dashboardSchedules for ID: " + req.query.id,
                                            err
                                        ));
                                    };

                                    // Count DashboardSubscriptions
                                    dashboardSubscriptionModel.find(dashboardIDQuery).count( (err, numberdashboardSubscriptions) => {
                                        if (err) {
                                            return res.json(createErrorObject(
                                                "error",
                                                "Error retrieving dashboardSubscriptions for ID: " + req.query.id,
                                                err
                                            ));
                                        };

                                        // Count DashboardTags
                                        dashboardTagModel.find(dashboardIDQuery).count( (err, numberdashboardTags) => {
                                            if (err) {
                                                return res.json(createErrorObject(
                                                    "error",
                                                    "Error retrieving dashboardTags for ID: " + req.query.id,
                                                    err
                                                ));
                                            };

                                            // Count DashboardPermissions
                                            dashboardPermissionModel.find(dashboardIDQuery).count( (err, numberdashboardPermissions) => {
                                                if (err) {
                                                    return res.json(createErrorObject(
                                                        "error",
                                                        "Error retrieving dashboardPermissions for ID: " + req.query.id,
                                                        err
                                                    ));
                                                };

                                                // Count widgetCheckpoints
                                                widgetCheckpointModel.find(dashboardIDQuery).count( (err, numberWidgetCheckpoints) => {
                                                    if (err) {
                                                        return res.json(createErrorObject(
                                                            "error",
                                                            "Error retrieving widgetCheckpoints for ID: " + req.query.id,
                                                            err
                                                        ));
                                                    };

                                                    // Count Widgets Hyperlinked to this Dashobard
                                                    const hyperlinkedQuery = { hyperlinkDashboardID: req.query.id };
                                                    widgetModel.find(hyperlinkedQuery).count( (err, numberHyperlinkedWidgets) => {
                                                        if (err) {
                                                            return res.json(createErrorObject(
                                                                "error",
                                                                "Error retrieving Hyperlinks to Dashboard for ID: " + hyperlinkedQuery,
                                                                err
                                                            ));
                                                        };

                                                        // Count this Dashboardused as a Template
                                                        const templateQuery = { templateDashboardID: req.query.id };
                                                        dashboardModel.find(templateQuery).count( (err, numberUsedAsTemplate) => {
                                                            if (err) {
                                                                return res.json(createErrorObject(
                                                                    "error",
                                                                    "Error retrieving this Dashboardused as a Template for ID: " + templateQuery,
                                                                    err
                                                                ));
                                                            };

                                                            // dashboardTemplates dashboardTemplates
                                                            // startupDashboards startupDashboards
                                                            // favouriteDashboards favouriteDashboards




                                                            // Return the data with metadata
                                                                return res.json(
                                                                    createReturnObject(
                                                                        "success",
                                                                        "Retrieved Summary for Dashboard ID: " + hyperlinkedQuery,
                                                                        { 
                                                                            dashboardID: id,
                                                                            numberDashboards: numberDashboards,
                                                                            numberDashboardTabs: numberDashboardTabs,
                                                                            numberWidgets: widgets.length,
                                                                            numberDatasources: numberDatasources.length,
                                                                            numberDashboardSnapshots: numberDashboardSnapshots,
                                                                            numberCanvasMessages: numberCanvasMessages,
                                                                            numberCanvasComments: numberCanvasComments,
                                                                            numberdashboardSchedules: numberdashboardSchedules,
                                                                            numberdashboardSubscriptions: numberdashboardSubscriptions,
                                                                            numberdashboardTags: numberdashboardTags,
                                                                            numberdashboardPermissions: numberdashboardPermissions,
                                                                            numberWidgetCheckpoints: numberWidgetCheckpoints,
                                                                            numberHyperlinkedWidgets: numberHyperlinkedWidgets,
                                                                            numberUsedAsTemplate: numberUsedAsTemplate
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
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
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