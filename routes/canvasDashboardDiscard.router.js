// Router Discard of a Draft Dashboard

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

const dataCachingTableVariable = require('../utils/dataCachingTableMemory.util');  // Var loaded at startup
var dataCachingTableArray = null;   // Local copy of dataCachingTable - STRUCTURE
var serverCacheableMemory;          // True if the current resource is cached - CURRENT VAR
var serverVariableName;             // Name in serverMemoryCache to store data for the current resource: cahced here - CURRENT VAR
var serverMemoryCacheModule = require('../utils/dataCachingDataMemory.util');
var serverMemoryCache = serverMemoryCacheModule.serverMemoryCache;  // Local Server Cache Data

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

    debugDev(moduleName + ": " + '## --------------------------');
    debugDev(moduleName + ": " + '## GET Starting with Discarding Draft Dashboard id:',
        draftDashboardID + ', OriginalID: ', originalDashboardID, draftDashboardQuery);

    // Load global variable for cachingTable STRUCTURE into an Array ONCE
    debugDev(moduleName + ": " + 'Initialise dataCachingTableArray ...')
    dataCachingTableArray = dataCachingTableVariable.get();

    // Try
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

        // Update IDs on the Original Dashboard
        dashboardModel.findOneAndUpdate(
            { "id": originalDashboardID },
            { $set: { "originalID": null, "draftID": null } }

        ).exec()

            // Delete Core Dashboard Entities for Draft: Dashboard
            .then((updatedOriginalDashboard)=>{

                serverVariableName = 'dashboards';
                let dataCachingTableArrayIndex = dataCachingTableArray.findIndex(dct => dct.key == serverVariableName);
    
                if (dataCachingTableArrayIndex >= 0) {
                    serverDataCachingTable = dataCachingTableArray[dataCachingTableArrayIndex];
                    serverCacheableMemory = serverDataCachingTable.serverCacheableMemory;
    
                    if (serverCacheableMemory) {
                        serverMemoryCache.update(serverVariableName, originalDashboardID, updatedOriginalDashboard);
                        debugDev(moduleName + ": " + 'Updated ' + serverVariableName 
                            + ' for ID: ', originalDashboardID);
                    };
                };

                dashboardModel.deleteOne(
                    { "id": draftDashboardID }
                ).exec()
            })

            // Delete Core Dashboard Entities for Draft: DashboardTab
            .then(()=>{

                serverVariableName = 'dashboards';
                let dataCachingTableArrayIndex = dataCachingTableArray.findIndex(dct => dct.key == serverVariableName);
    
                if (dataCachingTableArrayIndex >= 0) {
                    serverDataCachingTable = dataCachingTableArray[dataCachingTableArrayIndex];
                    serverCacheableMemory = serverDataCachingTable.serverCacheableMemory;
    
                    if (serverCacheableMemory) {
                        serverMemoryCache.remove(serverVariableName, originalDashboardID);
                        debugDev(moduleName + ": " + 'Removed ' + serverVariableName 
                            + ' for ID: ', originalDashboardID);
                    };
                };

                dashboardTabModel.deleteMany(
                    draftDashboardQuery
                ).exec()
            })

            // Delete Core Dashboard Entities for Draft: Widgets
            .then(()=>{
                widgetModel.deleteMany(
                    draftDashboardQuery
                ).exec()
            })

            // Delete Core Dashboard Entities for Draft: WidgetCheckpoints
            .then(()=>{
                widgetCheckpointModel.deleteMany(
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
                dashboardRecentModel.deleteMany(
                    draftDashboardQuery
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
                    "dashboardDiscard",
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
    }
    catch (error) {
        debugDev(moduleName + ": " + 'Error in canvasDashboardDiscard.router', error.message)
        return res.status(400).json({
            "statusCode": "error",
            "message" : "Error discarding Draft Dashboard id: " + draftDashboardID,
            "data": null,
            "error": error
        });
    };

})

// Export
module.exports = router;