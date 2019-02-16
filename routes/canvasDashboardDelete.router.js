// Router to delete a Dashboard and all related info, ie number of Widgets, number of tags, etc

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

// DELETE route
router.delete('/', (req, res, next) => {

    const startPos = module.id.lastIndexOf("/");
    if (startPos > 0  &&  startPos < module.id.length) {
        moduleName = module.id.substring(startPos + 1);
    };
    const dashboardID = +req.query.id;

    debugDev(moduleName + ": " + '## --------------------------');
    debugDev(moduleName + ": " + '## GET Starting with Deleting Dashboard and related info for dashboard id:', dashboardID);


    // Try, in case model file does not exist
    try {
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

        // TODO - Remove later !
        if (dashboardID <= 112) {
            return res.json(createErrorObject(
                "error",
                "Silly!!  Cannot delete ID <= 112 !",
                null
            ));
        };

        // Delete Dashboard
        // TODO - is this chaining working correctly vs .then() inside .then() ... ?
        dashboardModel.findOneAndDelete(dashboardQuery)
            .then(()=>{
                // Delete Dashboard Tabs
                dashboardTabModel.deleteMany(dashboardIDQuery).exec();
            })
            .then(()=>{
                // Delete Widgets
                widgetModel.deleteMany(dashboardIDQuery).exec();
            })
            .then(()=>{
                // Delete DashboardSnapshotModel
                dashboardSnapshotModel.deleteMany(dashboardIDQuery).exec();
            })
            .then(()=>{
                // Remove this Dashboard used in Messages
                canvasMessageModel.updateMany(dashboardIDQuery, { $set: { dashboardID: null } }).exec();
            })
            .then(()=>{
                // Delete CanvasCommentModel
                canvasCommentModel.deleteMany(dashboardIDQuery).exec();
            })
            .then(()=>{
                // Delete DashboardScheduleModel
                dashboardScheduleModel.deleteMany(dashboardIDQuery).exec();
            })
            .then(()=>{
                // Delete DashboardSubscriptionModel
                dashboardSubscriptionModel.deleteMany(dashboardIDQuery).exec();
            })
            .then(()=>{
                // Delete DashboardTagModel
                dashboardTagModel.deleteMany(dashboardIDQuery).exec();
            })
            .then(()=>{
                // Delete DashboardPermissionModel
                dashboardPermissionModel.deleteMany(dashboardIDQuery).exec();
            })
            .then(()=>{
                // Delete WidgetCheckpointModel
                widgetCheckpointModel.deleteMany(dashboardIDQuery).exec();
            })
            .then(()=>{
                // Remove hyperlinks to this Dashboard for Widgets
                let hyperlinkedQuery = {"hyperlinkDashboardID": { $eq: dashboardID } };
                widgetModel.updateMany(hyperlinkedQuery, { $set: { hyperlinkDashboardID: null } }).exec();
            })
            .then(()=>{
                // Remove this Dashboard used as template in Dashboards
                let templateQuery = {"templateDashboardID": { $eq: dashboardID } };
                dashboardModel.updateMany(templateQuery, { $set: { templateDashboardID: null } }).exec();
            })
            .then(()=>{
                // Remove this Dashboard used as Startup for Users
                let startupQuery = {"preferenceStartupDashboardID": { $eq: dashboardID } };
                canvasUserModel.updateMany(startupQuery, { $set: { preferenceStartupDashboardID: null } }).exec();
            })
            .then(()=>{
                // Remove this Dashboard used as Fav for Users
                canvasUserModel.update(
                    {},
                    { $pull: { "favouriteDashboards": dashboardID } },
                    { "multi": true }
                ).exec();
            })
            .then(()=>{
                // Remove DashboardLayout
                dashboardLayoutModel.findOne(dashboardIDQuery)
                    .then((doc)=>{
                        // Remove WidgetLayout for this DashboardLayout
                        if (doc != null) {
                            widgetLayoutModel.deleteMany({ dashboardLayoutID: doc.id }).exec();
                            dashboardLayoutModel.deleteMany(dashboardIDQuery).exec();
                        };
                    });
            })
            .then(()=>{
                // Remove this Dashboard from DashboardRecent
                dashboardRecentModel.deleteMany(dashboardIDQuery).exec();
            })
            .then(()=>{
                // Remove this Dashboard from StatusBarMessageLogModel
                statusBarMessageLogModel.deleteMany(dashboardIDQuery).exec();
            })
            .then(()=>{
                // Remove this Dashboard from DashboardScheduleLog
                dashboardScheduleLogModel.deleteMany(dashboardIDQuery).exec();
            })
            .then(()=>{
                // Remove this Dashboard used in CanvasTasks
                let linkedDashboardQuery = {"linkedDashboardID": { $eq: dashboardID } };
                canvasTasksModel.update(
                    linkedDashboardQuery,
                    { $set: { dashboardID: null } }
                ).exec();
            })


            .then(()=>{

                // Return the data with metadata
                return res.json(
                createReturnObject(
                    "success",
                    "Retrieved Summary for Dashboard ID: " ,
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
                console.log("Error deleting Dashboard for ID: " + dashboardID, err);
                return res.json(createErrorObject(
                    "error",
                    "Error deleting Dashboard for ID: " + dashboardID,
                    err
                ));
            });
    }
    catch (error) {
        debugDev(moduleName + ": " + 'Error in canvasDashboardSummary.router', error.message)
        return res.status(400).json({
            "statusCode": "error",
            "message" : "Error retrieving Current Dashboard ID: " + dashboardID,
            "data": null,
            "error": error
        });
    };

})

// Export
module.exports = router;