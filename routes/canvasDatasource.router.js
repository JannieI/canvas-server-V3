// Router for Canvas Datasource 
// Treats the Datasource - Dataset - Data objects in one go to keep i sync, and with same IDs

// Imports
const express = require('express');
const router = express.Router();
const debugDev = require('debug')('app:dev');
const createErrorObject = require('../utils/createErrorObject.util');
const createReturnObject = require('../utils/createReturnObject.util');
const datasourceSchema = '../models/datasources.model';
const datasetSchema = '../models/datasets.model';
const clientDataSchema = '../models/clientData.model';

// GET route
router.get('/', (req, res, next) => {

    debugDev('## --------------------------');
    debugDev('## GET Starting with CurrentDashboard with query:', req.query);
    
    // Try, in case model file does not exist
    try {
        // Get the model dynamically
        const datasourceModel = require(datasourceSchema);
        const datasetModel = require(datasetSchema);
        const clientDataModel = require(clientDataSchema);
        
        const datasourceID = req.query.id;

        // Find Datasource
        const datasourceQuery = { id: datasourceID };

        datasourceModel.find( datasourceQuery, (err, datasources) => {

            if (err) {
                return res.json(createErrorObject(
                    "error",
                    "Error retrieving Datasource for ID: " + req.query.id,
                    err
                ));
            };
            if (datasources == null) { 
                datasources = [];
            };
    
            // Find Datasets
            const datasetQuery = { datasourceID: datasourceID }
            datasetModel.find( datasetQuery, (err, datasets) => {

                if (err) {
                    return res.json(createErrorObject(
                        "error",
                        "Error retrieving Datasets for ID: " + datasourceID,
                        err
                    ));
                };
        
                // Find Data
                const dataQuery = { id: datasourceID }
                clientDataModel.find( dataQuery, (err, clientData) => {

                    if (err) {
                        return res.json(createErrorObject(
                            "error",
                            "Error retrieving Data for ID: " + req.query.id,
                            err
                        ));
                    };
                    if (clientData == null) { 
                        clientData = [];
                    };

                    // Return the data with metadata
                    return res.json(
                        createReturnObject(
                            "success",
                            "Retrieved data for Current Dashboard ID: " + req.query.id,
                            { 
                                datasources: datasources,
                                datasets: datasets,
                                clientData: clientData
                            },
                            null,
                            null,
                            null,
                            null,
                            null,
                            datasources.length,
                            null,
                            null
                            )
                    );
                });
            });
        });
    }
    catch (error) {
        debugDev('Error in canvasCurrentDashboard.router', error.message)
        return res.status(400).json({
            "statusCode": "error",
            "message" : "Error retrieving Current Dashboard ID: " + req.query.id,
            "data": null,
            "error": error
        });
    };

})


// POST route
router.post('/', (req, res, next) => {

    debugDev('## --------------------------');
    debugDev('## POST Starting with CurrentDashboard with query:', req.query);
    
    // Try, in case model file does not exist
    // try {
        // Get the model dynamically 
        const datasourceModel = require(datasourceSchema);
        const datasetModel = require(datasetSchema);
        const clientDataModel = require(clientDataSchema);

        const datasourceBody = req.body.datasource;
        const datasetBody = req.body.dataset;
        const clientDataBody = req.body.clientData;
        
        const datasourceID = req.query.id;

        // Add Datasource
        const datasourceQuery = { id: datasourceID };


        // Create object and save to DB
        let datasourceAdd = new canvasModel(datasourceBody);
        datasourceAdd.save()
            .then(datasourceAdded => {
                debugDev('New record added in canvasDatasourceRouter', datasourceAdded)
                return res.json(
                    createReturnObject(
                        "success",
                        "Added record for datasource, ID: " + datasourceAdded.id,
                        { 
                                datasource: datasourceAdded,
                                datasets: [],
                                clientData: []
                        },
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                    )
                );
            })
            .catch(err => {
                console.error(err)
                return res.json(
                    createErrorObject(
                        "error",
                        "Error: Could not add record for resource: " + resource,
                        err
                    )
                );
            });



    
    // }
    // catch (error) {
    //     debugDev('Error in canvasCurrentDashboard.router', error.message)
    //     return res.status(400).json({
    //         "statusCode": "error",
    //         "message" : "Error retrieving Current Dashboard ID: " + req.query.id,
    //         "data": null,
    //         "error": error
    //     });
    // };

})

// Export
module.exports = router;