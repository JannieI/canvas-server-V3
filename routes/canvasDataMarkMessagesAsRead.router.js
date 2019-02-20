// Router Mark CanvasMessages as 'read' for a given userID

// Imports
const express = require('express');
const router = express.Router();
const debugDev = require('debug')('app:dev');
const createErrorObject = require('../utils/createErrorObject.util');
const createReturnObject = require('../utils/createReturnObject.util');
const canvasMessageSchema = '../models/canvasMessages.model';

// PUT route
router.put('/', (req, res, next) => {

    const startPos = module.id.lastIndexOf("/");
    if (startPos > 0  &&  startPos < module.id.length) {
        moduleName = module.id.substring(startPos + 1);
    };

    // Get and validate parameters
    const userID = req.query.userID;
    if (userID == null  ||  userID == '') {
        return res.json(createErrorObject(
            "error",
            "Query parameter userID not provided: " + userID,
            null
        ));
    };

    debugDev(moduleName + ": " + '## --------------------------');
    debugDev(moduleName + ": " + '## Starting with marking CanvasMessages for userID :',
        userID);

    // Try
    try {
        // Get the models
        const canvasMessageModel = require(canvasMessageSchema);

        // Update Messages as read for this user
        let today = new Date();
        canvasMessageModel.updateMany(
            {"recipients.userID": userID},
            { $set: { "recipients.$.readOn": today } }
        ).exec()

        // Return with metaData
        .then(()=>{
            return res.json(
            createReturnObject(
                "success",
                "Marked Messages as read for : " + userID,
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
            console.log('Error marking Messages as read for :', userID, err);
            return res.json(createErrorObject(
                "error",
                "Error marking Messages as read for :" + userID,
                err
            ));
        });
    }
    catch (error) {
        debugDev(moduleName + ": " + 'Error in canvasDataMarkMessagesAsRead.router', error.message)
        return res.status(400).json({
            "statusCode": "error",
            "message" : "Error marking Messages as read for :" + userID,
            "data": null,
            "error": error
        });
    };

})

// Export
module.exports = router;