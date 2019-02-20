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
const widgetCheckpointSchema = '../models/widgetCheckpoints.model';
const dashboardLayoutSchema = '../models/dashboardLayouts.model';
const widgetLayoutSchema = '../models/widgetLayouts.model';

const dashboardModel = require(dashboardSchema);
const dashboardTabModel = require(dashboardTabSchema);
const widgetModel = require(widgetSchema);
const widgetCheckpointModel = require(widgetCheckpointSchema);
const widgetLayoutModel = require(widgetLayoutSchema);

var promiseArray = [];
let returnDraftDashboardTabs = [];
let returnWidgets = [];
let returnWidgetCheckpoints = [];
let today = new Date();

let orignalDashboardID;
let originalDashboardQuery;

function addDraftDashboard(originalDashboard) {
    return new Promise( (resolve, reject) => {

        // Create a new Draft Dashboard, pointing to the original
        let newDraftDashboard = JSON.parse(JSON.stringify(originalDashboard));

        newDraftDashboard._id = null;
        newDraftDashboard.id = null;
        newDraftDashboard.originalID = originalDashboard.id;
        newDraftDashboard.draftID = null;

        // TODO - add current user !!
        newDraftDashboard.editor = '';
        newDraftDashboard.dateEdited = today;
        newDraftDashboard.accessType = 'Private';
        newDraftDashboard.state = 'Draft';

        let dashboardAdd = new dashboardModel(newDraftDashboard);

        dashboardAdd.save()
            .then(addedDraftDashboard => {
                resolve(addedDraftDashboard)
            })
            .catch(err => {
                console.log('addDraftDashboard Error', err)
                reject(err)
            });
    })
}

function updateTabs(addedDashboardID, originalDashboardTab) {
    // Add the given tab to the DB, and then loop all all its Widgets, adding 
    // their creation function to promiseArray

    return new Promise( (resolve, reject) => {
        // Create a new Tab, pointing to the original
        let newDraftDashboardTab = JSON.parse(JSON.stringify(originalDashboardTab));
        newDraftDashboardTab._id = null;
        newDraftDashboardTab.id = null;
        newDraftDashboardTab.dashboardID = addedDashboardID;
        newDraftDashboardTab.originalID = originalDashboardTab.id;

        // TODO - add current user !!
        newDraftDashboardTab.editor = '';
        newDraftDashboardTab.dateEdited = today;

        let dashboardTabAdd = new dashboardTabModel(newDraftDashboardTab);

        dashboardTabAdd.save()
            .then(addedDraftDashboardTab => {
                console.log('updateTab After .save')
                returnDraftDashboardTabs.push(addedDraftDashboardTab);
                debugDev(moduleName + ": " + 'New Tab added' + addedDraftDashboardTab.id, addedDraftDashboardTab.originalID)

                // Get the Original Widgets
                let widgetQuery = {
                    dashboardID: originalDashboardID, 
                    dashboardTabID: originalDashboardTab.id
                };
                widgetModel.find(widgetQuery)
                    .then( widgets => {
                        console.log('updateTab After .find', widgetQuery, widgets)

                        widgets.forEach( widget => {
                            promiseArray.push(updateWidget(
                                addedDashboardID, 
                                addedDraftDashboardTab.id, 
                                widget
                            ));
                            console.log('In updateTabs After push ', addedDashboardID, 
                            addedDraftDashboardTab.id, widget.id)
                        });
                        resolve();
                    })
                    .catch(err => reject(err));
            
            })
            .catch(err => reject(err));
    })
}

function updateWidget(addedDashboardID, addedDashboardTabID, widget) {
    // Add the given Widget to the DB, and then loop all all its WidgetCheckpointss, adding 
    // their creation function to promiseArray
    return new Promise( (resolve, reject) => {
        console.log('updateWidget Start')
        // Create a new Widget, pointing to the original
        let newDraftWidget = JSON.parse(JSON.stringify(widget));
        newDraftWidget._id = null;
        newDraftWidget.id = null;
        newDraftWidget.dashboardID = addedDashboardID;
        newDraftWidget.dashboardTabID = addedDashboardTabID;
        newDraftWidget.originalID = widget.id;
        newDraftWidget.dashboardTabIDs = []; 
        newDraftWidget.dashboardTabIDs.push(addedDashboardTabID);

        // TODO - add current user !!
        newDraftWidget.editor = '';
        newDraftWidget.dateEdited = today;

        let dashboardWidgetAdd = new widgetModel(newDraftWidget);
        dashboardWidgetAdd.save()
            .then(addedDraftWidget => {
                returnWidgets.push(addedDraftWidget);
                debugDev(moduleName + ": " + 'New Widget added' + addedDraftWidget.id, widget.id)
                console.log('updateWidget After .save')
                let widgetCheckpointQuery = {dashboardID: dashboardID,
                    widgetID: widget.id}
                widgetCheckpointModel.find(widgetCheckpointQuery)
                    .then( widgetCheckpoints => {
                        widgetCheckpoints.forEach( widgetCheckpoint => {
                            // promiseArray.push(updateWidgetCheckpoint(widgetCheckpoint));
                        });
                        resolve();
                    })
                    .catch(err => reject(err))
            })
            .catch(err => reject(err))
    })

}

function updateWidgetCheckpoint(widgetCheckpoint) {

    return new Promise ( (resolve, reject) => {

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
        dashboardWidgetCheckpointAdd.save()
            .then(addedDraftWidgetCheckpoint => {
                returnWidgetCheckpoints.push(addedDraftWidgetCheckpoint);
                debugDev(moduleName + ": " + 'New Widget Checkpoint added' + addedDraftWidgetCheckpoint.id, addedDraftDashboardTab.id)
                resolve();
            })
            .catch(err => reject(err));                                                
    })
}

// POST route
router.post('/', (req, res, next) => {

    const startPos = module.id.lastIndexOf("/");
    if (startPos > 0  &&  startPos < module.id.length) {
        moduleName = module.id.substring(startPos + 1);
    };

    orignalDashboardID = req.query.orignalDashboardID;
    orignalDashboardID = +orignalDashboardID;
    originalDashboardQuery = { id: orignalDashboardID };
    
    debugDev(moduleName + ": " + '## --------------------------');
    debugDev(moduleName + ": " + '## POST Starting with Editing Dashboard and related info for dashboard id:', orignalDashboardID);


    // Try, in case model file does not exist
    // try {

        // Validations
        if (isNaN(orignalDashboardID)) {
            return res.json(createErrorObject(
                "error",
                "Query Parameter dashboardID is not a number or not provided",
                null
            ));
        };

        // Find Original Dashboard
        dashboardModel.findOne(originalDashboardQuery)
            .then((originalDashboard)=>{

                // Could be null if nothing was found
                if (originalDashboard == null) {
                    console.log("Dashboard does not exist for ID: " + orignalDashboardID, originalDashboardQuery)
                    return res.json(createErrorObject(
                        "error",
                        "Dashboard does not exist for ID: " + orignalDashboardID,
                        null
                    ));
                };
                
                addDraftDashboard(originalDashboard)
                    .then(addedDraftDashboard => {
                        debugDev(moduleName + ": " + 'New Dashboard added' + addedDraftDashboard.id)

                        // Update the Original Dashboard to point to the Draft
                        // Note - can be done in background since we dont use it
                        let originalDashboardNew = JSON.parse(JSON.stringify(originalDashboardNew));
                        originalDashboardNew.draftID = addedDraftDashboard.id;
                        dashboardModel.findOneAndUpdate(
                            originalDashboardQuery,
                            originalDashboardNew,
                            {
                                new: true,                       // return updated doc
                                runValidators: true              // validate before update
                            })
                            .then( (doc) => console.log('Original Dashboard SAVED', doc.id))

                        // Loop on Original Dashboard Tabs
                        dashboardTabModel.find({"dashboardID": { $eq: orignalDashboardID } })
                            .then(originalDashboardTabs => {
                                console.log('After find')

                                originalDashboardTabs.forEach(originalDashboardTab => {
                                    promiseArray.push(
                                        updateTabs(
                                            addedDraftDashboard.id, 
                                            originalDashboardTab
                                        )
                                    );
                                    console.log('After push for tab', originalDashboardTab.id)
                                });
                                console.log('Before promiseArray', promiseArray)
                                Promise.all(promiseArray)
                                    .then( () => {

                                        console.log('xx At END return now')
                                        // Return the data with metadata
                                        return res.json( createReturnObject(
                                            "success",
                                            "Edit: Draft Dashboard created with ID: " + orignalDashboardID,
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
                                    .catch( err => {
                                        console.log("Error in Promise.all for ID: " + orignalDashboardID, err)

                                        return res.json(createErrorObject(
                                            "error",
                                            "Error in Promise.all for ID: " + orignalDashboardID,
                                            err
                                        ));

                                    })
                            })
                            .catch( err => {
                                console.log("Error reading Tabs for ID: " + orignalDashboardID, err)
                                return res.json(createErrorObject(
                                    "error",
                                    "Error reading Tabs for ID: " + orignalDashboardID,
                                    err
                                ));

                            })

                    })
                    .catch( err => {
                        console.log("Error in addDraftDashboard.then for ID: " + orignalDashboardID, err)
                        return res.json(createErrorObject(
                            "error",
                            "Error in addDraftDashboard.then for ID: " + orignalDashboardID,
                            err
                        ));

                    })
            })
            .catch( err => {
                console.log("Error in dashboardModel.findOne for ID: " + orignalDashboardID, err)
                return res.json(createErrorObject(
                    "error",
                    "Error in dashboardModel.findOne for ID: " + orignalDashboardID,
                    err
                ));

            })

    
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