// Router to help with Discard of a Dashboard:
//   Moves certain info from Draft to the Original Dashboard
//   Note that the Delete of the Draft is done via the canvasDashboardDelete route

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

// PUT route
router.put('/', (req, res, next) => {

    const startPos = module.id.lastIndexOf("/");
    if (startPos > 0  &&  startPos < module.id.length) {
        moduleName = module.id.substring(startPos + 1);
    };
    const draftDashboardID = req.query.draftDashboardID;
    const originalDashboardID = req.query.originalDashboardID;
    const draftDashboardQuery = { "dashboardID": { $eq: draftDashboardID } };
    const dashboardOriginalQuery = { "dashboardID": { $eq: originalDashboardID } };

    debugDev(moduleName + ": " + '## --------------------------');
    debugDev(moduleName + ": " + '## GET Starting with Discarding Draft Dashboard id:', 
        draftDashboardID + ', OriginalID: ', originalDashboardID);
    
    
    // Try
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

        // Update IDs on the Original Dashboard
        dashboardModel.findOneAndUpdate(
            { "id": originalDashboardID}, 
            { $set: { "originalID": null, "draftID": null } }
        ).exec()

            // Delete Core Dashboard Entities for Draft: Dashboard
            .then(()=>{
                dashboardModel.deleteMany(
                    draftDashboardQuery
                ).exec()
            })

            // Delete Core Dashboard Entities for Draft: DashboardTab
            .then(()=>{
                dashboardTabModel.deleteMany(
                    draftDashboardQuery
                ).exec()
            })

            // Delete Core Dashboard Entities for Draft: WidgetCheckpoints
            .then(()=>{

                widgetQuery = {dashboardID: dashboardID}
                widgetModel.find(widgetQuery).then( widgets => {
                    widgets.forEach( widget => {
                        widgetCheckpointModel.deleteMany(
                            { widgetID: widget.id}
                        ).exec()
            })
        
            // Delete Core Dashboard Entities for Draft: Widgets
            .then(()=>{
                widgetModel.deleteMany(
                    draftDashboardQuery
                ).exec()
            })

            // Delete Related Entities: Dashboard Snapshots
            .then(()=>{
                dashboardSnapshotModel.deleteMany(
                    draftDashboardQuery
                ).exec()
            })

            // Delete Related Entities: Dashboard Schedules
            .then(()=>{
                dashboardScheduleModel.deleteMany(
                    draftDashboardQuery
                ).exec()
            })

            // Delete Related Entities: Dashboard ScheduleLog
            .then(()=>{
                dashboardScheduleLogModel.deleteMany(
                    draftDashboardQuery
                ).exec()
            })

            // Delete Related Entities: Dashboard SubscriptionModel
            .then(()=>{
                dashboardSubscriptionModel.deleteMany(
                    draftDashboardQuery
                ).exec()
            })

            // Delete Related Entities: Dashboard Tags
            .then(()=>{
                dashboardTagModel.deleteMany(
                    draftDashboardQuery
                ).exec()
            })
       
            // Delete Related Entities: Dashboard Permissions
            .then(()=>{
                dashboardPermissionModel.deleteMany(
                    draftDashboardQuery
                ).exec()
            })
            
            


            .then(()=>{
            canvasMessageModel.updateMany(
                    draftDashboardQuery, 
                    { $set: { dashboardID: originalDashboardID } }
                ).exec()
            })
            .then(()=>{
                    // Remove this Dashboard used in CanvasTasks
                    const taskDashboardQuery = { "linkedDashboardID": { $eq: draftDashboardID } };
                    canvasTasksModel.update(
                        taskDashboardQuery, 
                        { $set: { linkedDashboardID: originalDashboardID } }
                    ).exec()
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
                console.log('Error discarding Draft Dashboard id:', draftDashboardID, err);
                return res.json(createErrorObject(
                    "error",
                    "Error discarding Draft Dashboard id: " + draftDashboardID,
                    err
                ));
            });
    // }
    // catch (error) {
    //     debugDev(moduleName + ": " + 'Error in canvasDashboardSummary.router', error.message)
    //     return res.status(400).json({
    //         "statusCode": "error",
    //         "message" : "Error retrieving Current Dashboard ID: " + draftDashboardID,
    //         "data": null,
    //         "error": error
    //     });
    // };

})

// Export
module.exports = router;