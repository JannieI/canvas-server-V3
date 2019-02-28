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

const dataCachingTableVariable = require('../utils/dataCachingTableMemory.util');  // Var loaded at startup
var dataCachingTableArray = null;   // Local copy of dataCachingTable - STRUCTURE
var serverCacheableMemory;          // True if the current resource is cached - CURRENT VAR
var serverVariableName;             // Name in serverMemoryCache to store data for the current resource: cahced here - CURRENT VAR
var serverMemoryCacheModule = require('../utils/dataCachingDataMemory.util');
var serverMemoryCache = serverMemoryCacheModule.serverMemoryCache;  // Local Server Cache Data

var promiseArrayTabs = [];
var promiseArrayWidgets = [];
var promiseArrayWidgetCheckpoints = [];
let returnDraftDashboardTabs = [];
let returnWidgets = [];
let returnWidgetCheckpoints = [];
let today = new Date();

let originalDashboardID;
let originalDashboardQuery;
let newName;
let newState;

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
        newDraftDashboard.state = newState;
        newDraftDashboard.name = newName != ""?  newName  :  originalDashboard.name;

        let dashboardAdd = new dashboardModel(newDraftDashboard);

        dashboardAdd.save()
            .then(addedDraftDashboard => {
                resolve(addedDraftDashboard)
            })
            .catch(err => {
                console.error('addDraftDashboard Error', err)
                reject(err)
            });
    })
}

function updateTabs(addedDashboardID, originalDashboardTab) {
    // Add the given tab to the DB, and then loop all all its Widgets, adding
    // their creation function to promiseArrayWidgets

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
                returnDraftDashboardTabs.push(addedDraftDashboardTab);
                debugDev(moduleName + ": " + 'New Tab added: ' + addedDraftDashboardTab.id, addedDraftDashboardTab.originalID)

                // Get the Original Widgets
                let widgetQuery = {
                    dashboardID: originalDashboardID,
                    dashboardTabID: originalDashboardTab.id
                };
                widgetModel.find(widgetQuery)
                    .then( originalWidgets => {

                        originalWidgets.forEach(originalWidget => {
                            promiseArrayWidgets.push(updateWidget(
                                addedDashboardID,
                                addedDraftDashboardTab.id,
                                originalWidget
                            ));

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
    // their creation function to promiseArrayWidgetCheckpoints
    return new Promise( (resolve, reject) => {

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
        dashboardWidgetAdd.save()
            .then(addedDraftWidget => {
                returnWidgets.push(addedDraftWidget);
                debugDev(moduleName + ": " + 'New Widget added: ' + addedDraftWidget.id, originalWidget.id)

                // Find Original WidgetCheckpoints for the Original Widget
                let widgetCheckpointQuery = {
                    dashboardID: originalDashboardID,
                    widgetID: originalWidget.id
                };
                widgetCheckpointModel.find(widgetCheckpointQuery)
                    .then(originalWidgetCheckpoints => {
                        originalWidgetCheckpoints.forEach( originalWidgetCheckpoint => {
                            promiseArrayWidgetCheckpoints.push(updateWidgetCheckpoint(
                                addedDashboardID,
                                addedDashboardTabID,
                                addedDraftWidget.id,
                                originalWidgetCheckpoint));
                        });
                        resolve();
                    })
                    .catch(err => reject(err))
            })
            .catch(err => {
                console.error('ERROR !!!');
                reject(err)
            });
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
                debugDev(moduleName + ": " + 'New Widget Checkpoint added: ' + addedDraftWidgetCheckpoint.id, addedDraftDashboardTab.id)
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

    // Reset
    returnDraftDashboardTabs = [];
    returnWidgets = [];
    returnWidgetCheckpoints = [];

    originalDashboardID = req.query.originalDashboardID;
    originalDashboardID = +originalDashboardID;
    originalDashboardQuery = { id: originalDashboardID };
    newName = req.query.newName;
    newState = req.query.newState;

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
        if (newName == null  ||  newName == 'null') {
            newName = '';
        };
        if (newState != 'Draft'  &&  newState != 'Complete') {
            return res.json(createErrorObject(
                "error",
                "Query Parameter newState must be Draft or Complete",
                null
            ));
        };

        // Find Original Dashboard
        dashboardModel.findOne(originalDashboardQuery)
            .then((originalDashboard)=>{

                // Could be null if nothing was found
                if (originalDashboard == null) {
                    console.error("Dashboard does not exist for ID: " + originalDashboardID, originalDashboardQuery)
                    return res.json(createErrorObject(
                        "error",
                        "Dashboard does not exist for ID: " + originalDashboardID,
                        null
                    ));
                };

                addDraftDashboard(originalDashboard)
                    .then(addedDraftDashboard => {
                        debugDev(moduleName + ": " + 'New Dashboard added: ' + addedDraftDashboard.id)

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
                            .then( (updatedOriginalDashboard) => { 
                                console.log('Original Dashboard SAVED', updatedOriginalDashboard.id)

                                serverVariableName = 'dashboards';
                                if (dataCachingTableArray == null) {
                                    serverMemoryCache.add(serverVariableName, originalDashboardID);
                                } else {
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
                                };
                            })
                            .catch( err => {
                                console.error("Error updating Original Dashbord for ID: " + originalDashboardID, err)
                                return res.json(createErrorObject(
                                    "error",
                                    "Error updating Original Dashbord for ID: " + originalDashboardID,
                                    err
                                ));

                            })

                        // Loop on Original Dashboard Tabs
                        dashboardTabModel.find({"dashboardID": { $eq: originalDashboardID } })
                            .then(originalDashboardTabs => {

                                originalDashboardTabs.forEach(originalDashboardTab => {
                                    promiseArrayTabs.push(
                                        updateTabs(
                                            addedDraftDashboard.id,
                                            originalDashboardTab
                                        )
                                    );
                                });

                                // Note: the reason for the 3 different Promise Arrays is that it
                                // did not work when using a single one - DB would be updated but
                                // the execution did not continue after the last .then()  I guess
                                // it is a timing issue - the .all believes all is done, and takes
                                // over, but am not sure ...
                                Promise.all(promiseArrayTabs)
                                    .then( () => {

                                        Promise.all(promiseArrayWidgets)
                                        .then( () => {

                                            Promise.all(promiseArrayWidgetCheckpoints)
                                            .then( () => {

                                                // Load global variable for cachingTable STRUCTURE into an Array ONCE
                                                debugDev(moduleName + ": " + 'Initialise dataCachingTableArray ...')
                                                dataCachingTableArray = dataCachingTableVariable.get();

                                                // Safeguard
                                                if (dataCachingTableArray == null) {
                                                    dataCachingTableArray = [];
                                                };

                                                // TODO - we are not adjusting serverDataCachingTable.serverExpiryDateTime
                                                //        Is this correct ??
                                                // Add DATA to Cache if this resource is cached
                                                serverVariableName = 'dashboards';
                                                let dataCachingTableArrayIndex = dataCachingTableArray.findIndex(dct => dct.key == serverVariableName);

                                                if (dataCachingTableArrayIndex >= 0) {
                                                    serverDataCachingTable = dataCachingTableArray[dataCachingTableArrayIndex];
                                                    serverCacheableMemory = serverDataCachingTable.serverCacheableMemory;

                                                    if (serverCacheableMemory) {
                                                        serverMemoryCache.add(serverVariableName, addedDraftDashboard);
                                                        debugDev(moduleName + ": " + 'Added ' + serverVariableName 
                                                            + ' to cache, length: ', serverMemoryCache.get(serverVariableName).length)
                                                    };
                                                };

                                                serverVariableName = 'dashboardTabs';
                                                dataCachingTableArrayIndex = dataCachingTableArray.findIndex(dct => dct.key == serverVariableName);

                                                if (dataCachingTableArrayIndex >= 0) {
                                                    serverDataCachingTable = dataCachingTableArray[dataCachingTableArrayIndex];
                                                    serverCacheableMemory = serverDataCachingTable.serverCacheableMemory;

                                                    if (serverCacheableMemory) {
                                                        serverMemoryCache.add(serverVariableName, returnDraftDashboardTabs);
                                                        debugDev(moduleName + ": " + 'Added ' + serverVariableName 
                                                            + ' to cache, length: ', serverMemoryCache.get(serverVariableName).length)
                                                    };
                                                };

                                                serverVariableName = 'widgets';
                                                dataCachingTableArrayIndex = dataCachingTableArray.findIndex(dct => dct.key == serverVariableName);

                                                if (dataCachingTableArrayIndex >= 0) {
                                                    serverDataCachingTable = dataCachingTableArray[dataCachingTableArrayIndex];
                                                    serverCacheableMemory = serverDataCachingTable.serverCacheableMemory;

                                                    if (serverCacheableMemory) {
                                                        serverMemoryCache.add(serverVariableName, returnWidgets);
                                                        debugDev(moduleName + ": " + 'Added ' + serverVariableName 
                                                            + ' to cache, length: ', serverMemoryCache.get(serverVariableName).length)
                                                    };
                                                };

                                                serverVariableName = 'widgetCheckpoints';
                                                dataCachingTableArrayIndex = dataCachingTableArray.findIndex(dct => dct.key == serverVariableName);

                                                if (dataCachingTableArrayIndex >= 0) {
                                                    serverDataCachingTable = dataCachingTableArray[dataCachingTableArrayIndex];
                                                    serverCacheableMemory = serverDataCachingTable.serverCacheableMemory;

                                                    if (serverCacheableMemory) {
                                                        serverMemoryCache.add(serverVariableName, returnWidgetCheckpoints);
                                                        debugDev(moduleName + ": " + 'Added ' + serverVariableName 
                                                            + ' to cache, length: ', serverMemoryCache.get(serverVariableName).length)
                                                    };
                                                };

                                                console.log('xx Just before return')
                                                // Return the data with metadata
                                                return res.json( createReturnObject(
                                                    "success",
                                                    "dashboardCopy",
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
                                                console.error("Error in promiseArrayWidgetCheckpoints.all for ID: " + originalDashboardID, err)

                                                return res.json(createErrorObject(
                                                    "error",
                                                    "Error in promiseArrayWidgetCheckpoints.all for ID: " + originalDashboardID,
                                                    err
                                                ));

                                            })
                                        })
                                        .catch( err => {
                                            console.error("Error in promiseArrayWidgets.all for ID: " + originalDashboardID, err)

                                            return res.json(createErrorObject(
                                                "error",
                                                "Error in promiseArrayWidgets.all for ID: " + originalDashboardID,
                                                err
                                            ));

                                        })
                                    })
                                    .catch( err => {
                                        console.error("Error in promiseArrayTabs.all for ID: " + originalDashboardID, err)

                                        return res.json(createErrorObject(
                                            "error",
                                            "Error in promiseArrayTabs.all for ID: " + originalDashboardID,
                                            err
                                        ));

                                    })
                            })
                            .catch( err => {
                                console.error("Error reading Tabs for ID: " + originalDashboardID, err)
                                return res.json(createErrorObject(
                                    "error",
                                    "Error reading Tabs for ID: " + originalDashboardID,
                                    err
                                ));

                            })

                    })
                    .catch( err => {
                        console.error("Error in addDraftDashboard.then for ID: " + originalDashboardID, err)
                        return res.json(createErrorObject(
                            "error",
                            "Error in addDraftDashboard.then for ID: " + originalDashboardID,
                            err
                        ));

                    })
            })
            .catch( err => {
                console.error("Error in dashboardModel.findOne for ID: " + originalDashboardID, err)
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