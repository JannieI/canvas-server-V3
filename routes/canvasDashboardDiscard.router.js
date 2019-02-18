// Router to help with Discard of a Dashboard:
//   Moves certain info from Draft to the Original Dashboard
//   Note that the Delete of the Draft is done via the canvasDashboardDelete route

// Imports
const express = require('express');
const router = express.Router();
const debugDev = require('debug')('app:dev');
const createErrorObject = require('../utils/createErrorObject.util');
const createReturnObject = require('../utils/createReturnObject.util');
const canvasMessageSchema = '../models/canvasMessages.model';
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

    debugDev(moduleName + ": " + '## --------------------------');
    debugDev(moduleName + ": " + '## GET Starting with Discarding Draft Dashboard id:', 
        draftDashboardID + ', OriginalID: ', originalDashboardID);
    
    
    // Try
    // try {
        // Get the models
        const canvasMessageModel = require(canvasMessageSchema);
        const canvasTasksModel = require(canvasTasksSchema);

        // Remove this Dashboard used in Messages
        canvasMessageModel.updateMany(
                draftDashboardQuery, 
                { $set: { dashboardID: originalDashboardID } }
            ).exec()
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