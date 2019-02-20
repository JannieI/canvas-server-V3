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

let originalDashboardID;
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

        // Add new Draft Dashboard Tab
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
                    .then( originalWidgets => {
                        console.log('updateTab After .find', widgetQuery, originalWidgets.length)

                        originalWidgets.forEach(originalWidget => {
                            promiseArray.push(updateWidget(
                                addedDashboardID, 
                                addedDraftDashboardTab.id, 
                                originalWidget
                            ));
                            console.log('In updateTabs After push ', addedDashboardID, 
                            addedDraftDashboardTab.id, originalWidget.id)
                        });
                        resolve();
                    })
                    .catch(err => reject(err));
            
            })
            .catch(err => reject(err));
    })
}

function updateWidget(addedDashboardID, addedDashboardTabID, originalWidget) {
    // Add the given Widget to the DB, and then loop all all its WidgetCheckpointss, adding 
    // their creation function to promiseArray
    return new Promise( (resolve, reject) => {
        console.log('updateWidget Start')
        // Create a new Widget, pointing to the original
        let newDraftWidget = JSON.parse(JSON.stringify(originalWidget));
        newDraftWidget._id = null;
        newDraftWidget.id = null;
        newDraftWidget.dashboardID = addedDashboardID;
        newDraftWidget.dashboardTabID = addedDashboardTabID;
        newDraftWidget.originalID = originalWidget.id;
        newDraftWidget.dashboardTabIDs = []; 
        newDraftWidget.dashboardTabIDs.push(addedDashboardTabID);

        // TODO - add current user !!
        newDraftWidget.editor = '';
        newDraftWidget.dateEdited = today;

        // Add new Draft Widget
        let dashboardWidgetAdd = new widgetModel(newDraftWidget);
        console.log('updateWidget pre.Save')
        dashboardWidgetAdd.save()
            .then(addedDraftWidget => {
                console.log('updateWidget post.Save')
                returnWidgets.push(addedDraftWidget);
                debugDev(moduleName + ": " + 'New Widget added' + addedDraftWidget.id, originalWidget.id)
                console.log('updateWidget After .save')

                // Find Original WidgetCheckpoints for the Original Widget
                let widgetCheckpointQuery = {
                    dashboardID: originalDashboardID,
                    widgetID: originalWidget.id
                };
                widgetCheckpointModel.find(widgetCheckpointQuery)
                    .then(originalWidgetCheckpoints => {
                        originalWidgetCheckpoints.forEach( originalWidgetCheckpoint => {
                            promiseArray.push(updateWidgetCheckpoint(
                                addedDashboardID, 
                                addedDashboardTabID, 
                                addedDraftWidget.id, 
                                originalWidgetCheckpoint));
                        });
                        resolve();
                    })
                    .catch(err => reject(err))
            })
            .catch(err => reject(err))
    })

}

function updateWidgetCheckpoint(
    addedDashboardID, 
    addedDashboardTabID, 
    addedWidgetID,
    originalWidgetCheckpoint) {

    return new Promise ( (resolve, reject) => {

        // Create a new WidgetCheckpoint, pointing to the original
        let newDraftWidgetCheckpoint = JSON.parse(JSON.stringify(originalWidgetCheckpoint));
        newDraftWidgetCheckpoint._id = null;
        newDraftWidgetCheckpoint.id = null;
        newDraftWidgetCheckpoint.dashboardID = addedDashboardID;
        newDraftWidgetCheckpoint.widgetID = addedWidgetID;
        newDraftWidgetCheckpoint.originalID = originalWidgetCheckpoint.id;

        newDraftWidgetCheckpoint.widgetSpec.dashboardID = addedDashboardID;
        newDraftWidgetCheckpoint.widgetSpec.dashboardTabID  = addedDashboardTabID;
        newDraftWidgetCheckpoint.widgetSpec.id = addedWidgetID;
        newDraftWidgetCheckpoint.widgetSpec.originalID = originalWidgetCheckpoint.id;

        // Add new Draft WidgetCheckpoint
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

    originalDashboardID = req.query.orignalDashboardID;
    originalDashboardID = +originalDashboardID;
    originalDashboardQuery = { id: originalDashboardID };
    
    debugDev(moduleName + ": " + '## --------------------------');
    debugDev(moduleName + ": " + '## POST Starting with Editing Dashboard and related info for dashboard id:', originalDashboardID);


    // Try, in case model file does not exist
    // try {

        // Validations
        if (isNaN(originalDashboardID)) {
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
                    console.log("Dashboard does not exist for ID: " + originalDashboardID, originalDashboardQuery)
                    return res.json(createErrorObject(
                        "error",
                        "Dashboard does not exist for ID: " + originalDashboardID,
                        null
                    ));
                };
                
                addDraftDashboard(originalDashboard)
                    .then(addedDraftDashboard => {
                        debugDev(moduleName + ": " + 'New Dashboard added' + addedDraftDashboard.id)

                        // Update the Original Dashboard to point to the Draft
                        // Note - can be done in background since we dont use it
                        let originalDashboardNew = JSON.parse(JSON.stringify(originalDashboard));
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
                        dashboardTabModel.find({"dashboardID": { $eq: originalDashboardID } })
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
                                            "Edit: Draft Dashboard created with ID: " + originalDashboardID,
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
                                        console.log("Error in Promise.all for ID: " + originalDashboardID, err)

                                        return res.json(createErrorObject(
                                            "error",
                                            "Error in Promise.all for ID: " + originalDashboardID,
                                            err
                                        ));

                                    })
                            })
                            .catch( err => {
                                console.log("Error reading Tabs for ID: " + originalDashboardID, err)
                                return res.json(createErrorObject(
                                    "error",
                                    "Error reading Tabs for ID: " + originalDashboardID,
                                    err
                                ));

                            })

                    })
                    .catch( err => {
                        console.log("Error in addDraftDashboard.then for ID: " + originalDashboardID, err)
                        return res.json(createErrorObject(
                            "error",
                            "Error in addDraftDashboard.then for ID: " + originalDashboardID,
                            err
                        ));

                    })
            })
            .catch( err => {
                console.log("Error in dashboardModel.findOne for ID: " + originalDashboardID, err)
                return res.json(createErrorObject(
                    "error",
                    "Error in dashboardModel.findOne for ID: " + originalDashboardID,
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