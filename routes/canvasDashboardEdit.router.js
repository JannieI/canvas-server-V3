// Router to Edits a Complete Dashboard and all core info, ie Tabs, Widgets, Wcheckpoints
// It then recreates the structure of the linked IDs: D -> T -> W

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
const canvasUserSchema = '../models/canvasUsers.model';
const dashboardLayoutSchema = '../models/dashboardLayouts.model';
const widgetLayoutSchema = '../models/widgetLayouts.model';
const dashboardRecentSchema = '../models/dashboardsRecent.model';
const statusBarMessageLogSchema = '../models/statusBarMessageLogs.model';
const dashboardScheduleLogSchema = '../models/dashboardScheduleLog.model';
const canvasTasksSchema = '../models/canvasTasks.model';
// const datasourceFilterSchema = '../models/datasourceFilter.model';  - TODO fix once designed

// GET route
router.get('/', (req, res, next) => {

    const startPos = module.id.lastIndexOf("/");
    if (startPos > 0  &&  startPos < module.id.length) {
        moduleName = module.id.substring(startPos + 1);
    };
    const dashboardID = +req.query.dashboardID;

    debugDev(moduleName + ": " + '## --------------------------');
    debugDev(moduleName + ": " + '## GET Starting with Deleting Dashboard and related info for dashboard id:', dashboardID);


    // Try, in case model file does not exist
    // try {
        // Get the models
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
        const canvasUserModel = require(canvasUserSchema);
        const dashboardLayoutModel = require(dashboardLayoutSchema);
        const widgetLayoutModel = require(widgetLayoutSchema);
        const dashboardRecentModel = require(dashboardRecentSchema);
        const statusBarMessageLogModel = require(statusBarMessageLogSchema);
        const dashboardScheduleLogModel = require(dashboardScheduleLogSchema);
        const canvasTasksModel = require(canvasTasksSchema);

        // NOTE: the INDENTATIONS below are non-standard for readibility given the
        //       large amount of .then() ...

        if (isNaN(dashboardID)) {
            return res.json(createErrorObject(
                "error",
                "Query Parameter dashboardID is not a number or not provided",
                null
            ));
        };

        // Delete Dashboards
        const dashboardQuery = { id: dashboardID };
        const dashboardIDQuery = {"dashboardID": { $eq: dashboardID } };

        // Get Dashboard
        // TODO - is this chaining working correctly vs .then() inside .then() ... ?
        dashboardModel.findOne(dashboardQuery)
            .then((dashboard)=>{
                if (dashboard == null) {
                    return res.json(createErrorObject(
                        "error",
                        "Dashboard does not exist for ID: " + dashboardID,
                        null
                    )); 
                };
        
                // Loop on Dashboard Tabs
                dashboardTabModel.find(dashboardIDQuery)
                    .then( tabs => {
                        tabs.forEach( tab => {
                        console.log('tab', tab.id, tab.dashboardID, tab.name)
                        })
                    })
            })
                // widgetModel.deleteMany(dashboardIDQuery).exec();
                // widgetCheckpointModel.deleteMany(dashboardIDQuery).exec();


            .then(()=>{

                // Return the data with metadata
                return res.json(
                createReturnObject(
                    "success",
                    "Edit: Draft Dashboard created with ID: " + dashboard.id,
                    "Okay",
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
            })

            .catch((err)=>{
                console.log("Error editing (create Draft) Dashboard for ID: " + dashboardID, err);
                return res.json(createErrorObject(
                    "error",
                    "Error editing Dashboard for ID: " + dashboardID,
                    err
                ));
            });
    // }
    // catch (error) {
    //     debugDev(moduleName + ": " + 'Error in canvasDashboardSummary.router', error.message)
    //     return res.status(400).json({
    //         "statusCode": "error",
    //         "message" : "Error retrieving Current Dashboard ID: " + dashboardID,
    //         "data": null,
    //         "error": error
    //     });
    // };

})

// Export
module.exports = router;