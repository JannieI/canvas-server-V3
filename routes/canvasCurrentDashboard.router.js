// Router for Current Canvas Dashboard, with all required info for Widgets, etc

// Imports
const express = require('express');
const router = express.Router();
const debugDev = require('debug')('app:dev');
const createErrorObject = require('../utils/createErrorObject.util');
const createReturnObject = require('../utils/createReturnObject.util');
const dashboardSchema = '../models/dashboards.model';
const dashboardTabSchema = '../models/dashboardTabs.model';
const widgetSchema = '../models/widgets.model';
const datasourceSchema = '../models/datasources.model';

// GET route
router.get('/', (req, res, next) => {

    const startPos = module.id.lastIndexOf("/");
    if (startPos > 0  &&  startPos < module.id.length) {
        moduleName = module.id.substring(startPos + 1);
    };

    debugDev(moduleName + ": " + '## --------------------------');
    debugDev(moduleName + ": " + '## GET Starting with CurrentDashboard with query:', req.query);
    
    // Try, in case model file does not exist
    // Get the model dynamically (take note of file spelling = resource)
    const dashboardModel = require(dashboardSchema);
    const dashboardTabModel = require(dashboardTabSchema);
    const widgetModel = require(widgetSchema);
    const datasourceModel = require(datasourceSchema);

    console.log('Before full def')
    // dashboardSchema
    //     .virtual('full')
    //     .get(function () {
    //         return this.code;
    //     });
    console.log('After full def')
    
    // theSituation.name.full;


    try {
        // dashboardSchema.virtual('numberWidgets', {
        //     ref: 'widgetModel', // The model to use
        //     localField: 'id', // Find people where `localField`
        //     foreignField: 'dashboardID', // is equal to `foreignField`
        //     count: true // And only get the number of docs
        // });
    }
    catch (error) {
        debugDev(moduleName + ": " + 'Error in canvasCurrentDashboard.router', error.message)
        return res.status(400).json({
            "statusCode": "error",
            "message" : "Error retrieving Current Dashboard ID: " + req.query.id,
            "data": null,
            "error": error
        });
    };
    console.log('Before findOne')
    // dashboardModel.findOne({ id: 112 }, (err, doc) => {
    //     populate('numberWidgets');
    //     console.log('OMW !', doc); 
    // })

    dashboardModel
        .findOne({ id: 112 })
        .populate('numberWidgets') 
        .exec(function(err, doc) {
            if (err) console.log('Error', err);
            console.log('Done', doc.id, doc.numberWidgets.length, doc);
    });
    console.log('After the affair');
    res.json("Okay")


    // Try, in case model file does not exist
    // try {
    //     // Get the model dynamically (take note of file spelling = resource)
    //     const dashboardModel = require(dashboardSchema);
    //     const dashboardTabModel = require(dashboardTabSchema);
    //     const widgetModel = require(widgetSchema);
    //     const datasourceModel = require(datasourceSchema);

    //     // Find Dashboard
    //     const dashboardQuery = { id: req.query.id };
    //     dashboardModel.find( dashboardQuery, (err, dashboards) => {

    //         if (err) {
    //             return res.json(createErrorObject(
    //                 "error",
    //                 "Error retrieving Dashboard for ID: " + req.query.id,
    //                 err
    //             ));
    //         };
                
    //         // Find Dashboard Tabs
    //         const dashboardTabQuery = { dashboardID: req.query.id }
    //         dashboardTabModel.find( dashboardTabQuery, (err, dashboardTabs) => {

    //             if (err) {
    //                 return res.json(createErrorObject(
    //                     "error",
    //                     "Error retrieving Widgets for ID: " + req.query.id,
    //                     err
    //                 ));
    //             };
        
    //             // Find Widgets
    //             const widgetQuery = { dashboardID: req.query.id }
    //             widgetModel.find( dashboardTabQuery, (err, widgets) => {

    //                 if (err) {
    //                     return res.json(createErrorObject(
    //                         "error",
    //                         "Error retrieving Dashboard Tabs for ID: " + req.query.id,
    //                         err
    //                     ));
    //                 };
    //                 if (widgets == null) { 
    //                     widgets = [];
    //                 };

    //                 // Load an Array of Datasource IDs in use by the Widgets on this Tab
    //                 let datasourceIDincludeArray = [];
    //                 for (var i = 0; i < widgets.length; i++) {

    //                     // Exclude Shapes that does not use Datasources
    //                     if (widgets[i].datasourceID != null) {
    //                         if (datasourceIDincludeArray.indexOf(widgets[i].datasourceID) < 0) {
    //                             datasourceIDincludeArray.push(widgets[i].datasourceID)
    //                         };
    //                     };
    //                 };
    //                 console.log('xx datasourceIDincludeArray', datasourceIDincludeArray)

    //                 // Get Array of Datasource IDs to exclude.  This is an optional parameter from Workstation
    //                 // and used in case it already has some Datasources (ie from a previous Tab)
    //                 const datasourceIDexclude = req.query.datasourceIDexclude;
    //                 let datasourceIDexcludeArray = [];
    //                 if (datasourceIDexclude != null) {
    //                     datasourceIDexcludeArray = datasourceIDexclude.split(",");
    //                     for (var i = 0; i < datasourceIDexcludeArray.length; i++) {
    //                         datasourceIDexcludeArray[i] = +datasourceIDexcludeArray[i];
    //                     };
    //                 };

    //                 // Exclude requested Datasource IDs
    //                 if (datasourceIDexcludeArray.length > 0) {
    //                     datasourceIDincludeArray = datasourceIDincludeArray
    //                         .filter(x => datasourceIDexcludeArray.indexOf(x) < 0);
    //                 };

    //                 // Create query object to filter on
    //                 let datasourceQuery = { 
    //                     id: { "$in": datasourceIDincludeArray }
    //                 }
    //                 console.log('xx datasourceQuery', datasourceQuery)
                 
    //                 datasourceModel.find( datasourceQuery, (err, datasources) => {

    //                     if (err) {
    //                         return res.json(createErrorObject(
    //                             "error",
    //                             "Error retrieving Datasource for ID: " + req.query.id,
    //                             err
    //                         ));
    //                     };
    //                     if (datasources == null) { 
    //                         datasources = [];
    //                     };

    //                 // Return the data with metadata
    //                     return res.json(
    //                         createReturnObject(
    //                             "success",
    //                             "Retrieved data for Current Dashboard ID: " + req.query.id,
    //                             { 
    //                                 dashboards: dashboards,
    //                                 dashboardTabs: dashboardTabs,
    //                                 widgets: widgets,
    //                                 datasources: datasources
    //                             },
    //                             null,
    //                             null,
    //                             null,
    //                             null,
    //                             null,
    //                             dashboards.length,
    //                             null,
    //                             null
    //                             )
    //                     );
    //                 });
    //             });
    //         });
    //     });
    // }
    // catch (error) {
    //     debugDev(moduleName + ": " + 'Error in canvasCurrentDashboard.router', error.message)
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