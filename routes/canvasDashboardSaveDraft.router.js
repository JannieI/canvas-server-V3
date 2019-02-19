// Router to Save a Draft Dashboard back to the Original

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

    // Get and validate parameters
    const draftDashboardID = req.query.draftDashboardID;
    const originalDashboardID = req.query.originalDashboardID;
    const draftDashboardQuery = { "dashboardID": draftDashboardID };
    const originalDashboardQuery = { "dashboardID": originalDashboardID };
    const deleteSnapshots = req.query.deleteSnapshots;

    if (draftDashboardID == null  || isNaN(draftDashboardID)) {
        return res.json(createErrorObject(
            "error",
            "Query parameter draftDashboardID not provided: " + draftDashboardID,
            null
        ));
    };
    if (originalDashboardID == null  || isNaN(originalDashboardID)) {
        return res.json(createErrorObject(
            "error",
            "Query parameter originalDashboardID not provided: " + originalDashboardID,
            null
        ));
    };
    if (deleteSnapshots == null  ||  deleteSnapshots != true) {
        deleteSnapshots = false;
    };

    debugDev(moduleName + ": " + '## --------------------------');
    debugDev(moduleName + ": " + '## GET Starting with Saving Draft Dashboard id:',
        draftDashboardID + ', OriginalID: ', originalDashboardID, draftDashboardQuery, 
        'deleteSnapshots: ', deleteSnapshots);

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
        dashboardModel.findOne( { "id": draftDashboardID } )
            .then((draftDashboard)=>{

                // Replace the content of the Original with that of the Draft
                dashboardModel.findOne( { "id": originalDashboardID } )
                    .then((originalDashboard)=>{
                        originalDashboard.originalID = null;
                        originalDashboard.draftID = null;
                        originalDashboard.state = "Complete";
                    
                        dashboardModel.findOneAndUpdate(
                            { "id": originalDashboardID },
                            originalDashboard
                        ).exec()
                    })

                    // Move Linked Entities to Original: Tabs
                    .then(()=>{
                        dashboardTabModel.updateMany(
                            draftDashboardQuery,
                            { $set: { dashboardID: originalDashboardID, originalID : null } }
                        ).exec()
                    })
                    // Move Linked Entities to Original: Widgets
                    .then(()=>{
                        widgetModel.updateMany(
                            draftDashboardQuery,
                            { $set: { dashboardID: originalDashboardID, originalID : null } }
                        ).exec()
                    })
                    // Move Linked Entities to Original: WidgetCheckpoints
                    .then(()=>{
                        widgetCheckpointModel.updateMany(
                            draftDashboardQuery,
                            { $set: { dashboardID: originalDashboardID, originalID : null } }
                        ).exec()
                    })

                    // NB: NOTE switch between draft... and original... here !!
                    // Delete Core Dashboard Entities for Draft: Dashboard
                    .then(()=>{
                        dashboardModel.deleteOne(
                            { "id": draftDashboardID }
                        ).exec()
                    })

                    // Delete Core Dashboard Entities for Original: DashboardTab
                    .then(()=>{
                        dashboardTabModel.deleteMany(
                            originalDashboardQuery
                        ).exec()
                    })

                    // Delete Core Dashboard Entities for Original: Widgets
                    .then(()=>{
                        widgetModel.deleteMany(
                            originalDashboardQuery
                        ).exec()
                    })

                    // Delete Core Dashboard Entities for Original: WidgetCheckpoints
                    .then(()=>{
                        widgetCheckpointModel.deleteMany(
                            originalDashboardQuery
                        ).exec()
                    })

                    // Delete Related Entities: Dashboard Snapshots (optional)
                    .then(()=>{
                        if (deleteSnapshots) {
                            console.log('xxxx deleteSnapshotsdeleteSnapshots deleteSnapshots')
                            dashboardSnapshotModel.deleteMany(
                                draftDashboardQuery
                            ).exec()
                        };
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

                    // Related Entities: Remove this Dashboard used as Fav for Users
                    .then(()=>{
                        canvasUserModel.update(
                            {},
                            { $pull: { "favouriteDashboards": draftDashboardID } },
                            { "multi": true }
                        ).exec();
                    })

                    // Delete Related Entities: Dashboard- and WidgetLayout
                    .then(()=>{
                        dashboardLayoutModel.findOne(draftDashboardQuery)
                            .then((doc)=>{
                                // Remove WidgetLayout for this DashboardLayout
                                if (doc != null) {
                                    widgetLayoutModel.deleteMany({ dashboardLayoutID: doc.id }).exec();
                                    dashboardLayoutModel.deleteMany(draftDashboardQuery).exec();
                                };
                            });
                    })

                    // Move Linked Entities to Original: Comments
                    .then(()=>{
                        canvasCommentModel.updateMany(
                            draftDashboardQuery,
                            { $set: { dashboardID: originalDashboardID } }
                        ).exec()
                    })

                    // Move Linked Entities to Original: Message
                    .then(()=>{
                        canvasMessageModel.updateMany(
                            draftDashboardQuery,
                            { $set: { dashboardID: originalDashboardID } }
                        ).exec()
                    })

                    // Move Linked Entities to Original: Tasks
                    .then(()=>{
                        const taskDashboardQuery = { "linkedDashboardID": { $eq: draftDashboardID } };
                        canvasTasksModel.update(
                            taskDashboardQuery,
                            { $set: { linkedDashboardID: originalDashboardID } }
                        ).exec()
                    })

                    // Move Linked Entities to Original: Hyperlinked Widgets
                    .then(()=>{
                        let hyperlinkedQuery = {"hyperlinkDashboardID": { $eq: draftDashboardID } };
                        widgetModel.updateMany(
                            hyperlinkedQuery,
                            { $set: { hyperlinkDashboardID: originalDashboardID } }
                        ).exec();
                    })

                    // Move Linked Entities to Original: Startup for Users
                    .then(()=>{
                        let startupQuery = {"preferenceStartupDashboardID": { $eq: draftDashboardID } };
                        canvasUserModel.updateMany(
                            startupQuery,
                            { $set: { preferenceStartupDashboardID: originalDashboardID } }
                        ).exec();
                    })

                    // Move Linked Entities to Original: Template
                    .then(()=>{
                        let templateQuery = {"templateDashboardID": { $eq: draftDashboardID } };
                        dashboardModel.updateMany(
                            templateQuery,
                            { $set: { templateDashboardID: originalDashboardID } }
                        ).exec();
                    })

                    // Delete General Entities: Recent
                    .then(()=>{
                        // Remove the Draft as it does not exist
                        dashboardRecentModel.deleteMany(
                            draftDashboardQuery
                        ).exec()
                        // As the TabIDs have changes, set to the first one
                        dashboardSubscriptionModel.updateMany(
                            originalDashboardQuery,
                            { $set: { dashboardTabID: -1 } }
                        ).exec()

                    })

                    // Delete General Entities: StatusBar
                    .then(()=>{
                        statusBarMessageLogModel.deleteMany(
                            draftDashboardQuery
                        ).exec()
                    })

                    // Return with metaData
                    .then(()=>{
                        return res.json(
                        createReturnObject(
                            "success",
                            "Discarded Draft Dashboard ID: " + draftDashboardID,
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