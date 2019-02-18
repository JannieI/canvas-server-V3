// Router to Edits a Complete Dashboard and all core info, ie Tabs, Widgets, Wcheckpoints
// It then recreates the structure of the linked IDs: D -> T -> W


// NB - not working as yet - need to fix ASYNC (forEach is sync) with Promise.all



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
    debugDev(moduleName + ": " + '## GET Starting with Editing Dashboard and related info for dashboard id:', dashboardID);


    // Try, in case model file does not exist
    // try {
        // Get the models
        const dashboardModel = require(dashboardSchema);
        const dashboardTabModel = require(dashboardTabSchema);
        const widgetModel = require(widgetSchema);
        const widgetCheckpointModel = require(widgetCheckpointSchema);
        const widgetLayoutModel = require(widgetLayoutSchema);

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

        // Find Original Dashboard
        dashboardModel.findOne(dashboardQuery)
        .then((dashboard)=>{

            // Could be null if nothing was found
            if (dashboard == null) {
                console.log("Dashboard does not exist for ID: " + dashboardID)
                return res.json(createErrorObject(
                    "error",
                    "Dashboard does not exist for ID: " + dashboardID,
                    null
                ));
            };

            // Arrays to be returned
            let returnDraftDashboardTabs = [];
            let returnWidgets = [];
            let returnWidgetCheckpoints = [];

            // Create a new Draft Dashboard, pointing to the original
            let today = new Date();
            let newDraftDashboard = JSON.parse(JSON.stringify(dashboard));
            newDraftDashboard._id = null;
            newDraftDashboard.id = null;
            newDraftDashboard.originalID = dashboard.id;
            newDraftDashboard.draftID = null;

            // TODO - add current user !!
            newDraftDashboard.editor = '';
            newDraftDashboard.dateEdited = today;
            newDraftDashboard.accessType = 'Private';
            newDraftDashboard.state = 'Draft';

            let dashboardAdd = new dashboardModel(newDraftDashboard);
            dashboardAdd.save().then(addedDraftDashboard => {
                debugDev(moduleName + ": " + 'New Dashboard added' + addedDraftDashboard.id)

                // Update the Original Dashboard to point to the Draft
                // Note - can be done in background since we dont use it
                let originalDashboard = JSON.parse(JSON.stringify(dashboard));
                originalDashboard.draftID = addedDraftDashboard.id;
                dashboardModel.findOneAndUpdate(
                    dashboardQuery,
                    originalDashboard,
                    {
                        new: true,                       // return updated doc
                        runValidators: true              // validate before update
                    })
                    .then( (doc) => console.log('Original Dashboard SAVED', doc.id)
                    )

                // Loop on Dashboard Tabs
                dashboardTabModel.find(dashboardIDQuery).then( tabs => {
                    tabs.forEach( tab => {

                        // Create a new Tab, pointing to the original
                        let newDraftDashboardTab = JSON.parse(JSON.stringify(tab));
                        newDraftDashboardTab._id = null;
                        newDraftDashboardTab.id = null;
                        newDraftDashboardTab.dashboardID = addedDraftDashboard.id;
                        newDraftDashboardTab.originalID = tab.id;

                        // TODO - add current user !!
                        newDraftDashboardTab.editor = '';
                        newDraftDashboardTab.dateEdited = today;

                        let dashboardTabAdd = new dashboardTabModel(newDraftDashboardTab);

                        dashboardTabAdd.save().then(addedDraftDashboardTab => {
                            returnDraftDashboardTabs.push(addedDraftDashboardTab);
                            debugDev(moduleName + ": " + 'New Tab added' + addedDraftDashboardTab.id, addedDraftDashboardTab.originalID)
                            widgetQuery = {dashboardID: dashboardID, dashboardTabID: tab.id}
                            widgetModel.find(widgetQuery).then( widgets => {
                                widgets.forEach( widget => {

                                    // Create a new Widget, pointing to the original
                                    let newDraftWidget = JSON.parse(JSON.stringify(widget));
                                    newDraftWidget._id = null;
                                    newDraftWidget.id = null;
                                    newDraftWidget.dashboardID = addedDraftDashboard.id;
                                    newDraftWidget.dashboardTabID = addedDraftDashboardTab.id;
                                    newDraftWidget.originalID = widget.id;
                                    newDraftWidget.dashboardTabIDs = []; addedDraftDashboardTab.id;
                                    newDraftWidget.dashboardTabIDs.push(addedDraftDashboardTab.id);

                                    // TODO - add current user !!
                                    newDraftWidget.editor = '';
                                    newDraftWidget.dateEdited = today;

                                    let dashboardWidgetAdd = new widgetModel(newDraftWidget);
                                    dashboardWidgetAdd.save().then(addedDraftWidget => {

                                        returnWidgets.push(addedDraftWidget);
                                        debugDev(moduleName + ": " + 'New Widget added' + addedDraftWidget.id, widget.id)

                                        widgetCheckpointQuery = {dashboardID: dashboardID,
                                            widgetID: widget.id}
                                        widgetCheckpointModel.find(widgetCheckpointQuery)
                                        .then( widgetCheckpoints => {
                                            widgetCheckpoints.forEach( widgetCheckpoint => {

                                                // Create a new WidgetCheckpoint, pointing to the original
                                                let newDraftWidgetCheckpoint = JSON.parse(JSON.stringify(widgetCheckpoint));
                                                newDraftWidgetCheckpoint._id = null;
                                                newDraftWidgetCheckpoint.id = null;
                                                newDraftWidgetCheckpoint.dashboardID = addedDraftDashboard.id;
                                                newDraftWidgetCheckpoint.widgetID = addedDraftWidget.id;
                                                newDraftWidgetCheckpoint.originalID = widgetCheckpoint.id;

                                                newDraftWidgetCheckpoint.widgetSpec.dashboardID = addedDraftDashboard.id;
                                                newDraftWidgetCheckpoint.widgetSpec.dashboardTabID  = addedDraftDashboardTab.id;
                                                newDraftWidgetCheckpoint.widgetSpec.id = addedDraftWidget.id;
                                                newDraftWidgetCheckpoint.widgetSpec.originalID = widgetCheckpoint.id;

                                                let dashboardWidgetCheckpointAdd = new widgetCheckpointModel(newDraftWidgetCheckpoint);
                                                dashboardWidgetCheckpointAdd.save().then(addedDraftWidgetCheckpoint => {
                                                    returnWidgetCheckpoints.push(addedDraftWidgetCheckpoint);
                                                    debugDev(moduleName + ": " + 'New Widget Checkpoint added' + addedDraftWidgetCheckpoint.id, addedDraftDashboardTab.id)
                                                                                            
                                                })

                                            })
                                        })
                                    })
                                })
                            })
                            .then( () => {
                                console.log('xx At END return now')
                                // Return the data with metadata
                                return res.json( createReturnObject(
                                    "success",
                                    "Edit: Draft Dashboard created with ID: " + dashboardID,
                                    {
                                        dashboard: addedDraftDashboard,
                                        dashboardTabs: returnDraftDashboardTabs,
                                        widgets: returnWidgets,
                                        widgetCheckpoints: returnWidgetCheckpoints
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

                            })
                        })
                    })
                })
                .catch( err => {
                    return res.json(createErrorObject(
                        "error",
                        "Error reading Tabs for ID: " + dashboardID,
                        err
                    ));

                })
            })
            .catch( err => {
                return res.json(createErrorObject(
                    "error",
                    "Error Adding Dashboard for ID: " + dashboardID,
                    err
                ));

            })

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