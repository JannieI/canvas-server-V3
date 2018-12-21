// Router for All Canvas (application-specific) data routes

// Imports
const express = require('express');
const passport = require('passport');
const router = express.Router();
const Joi = require('joi');

// Validate route
function validateRoute(course) {

	// Schema of what to validate
	const schema = {
		resource: Joi.string().min(3).required()
	};

	return Joi.validate(course, schema);
}
 
// Runs for ALL requests
router.use('/:resource', (req, res, next) => {

    // Validate Params
    if (!req.params) {
        res.status(400).json({
            "statusCode": "error",
            "message" : "Error: Resource not provided",
            "data": null,
            "error": "Error: Resource not provided"
        });
        return;
    };

    // Continue
    next();
})

// GET route
router.get('/:resource', (req, res, next) => {

    // Extract: query, route (params without :)
    const resource = req.param('resource').substring(1);
    const query = req.query;
    console.log('Router: GET for resource:', resource, 'query:', query);
    console.log('');

    // Validate
    const { error } = validateRoute(req.params);
    if (error) {
        res.status(400).json({
            "statusCode": "error",
            "message" : error.details[0].message,
            "data": null,
            "error": err
        });
    
        return;
    };

    // Try, in case model file does not exist
    try {
        // Get the model dynamically (take note of file spelling = resource)
        const canvasSchema = '../model/' + resource;
        const canvasModel = require(canvasSchema);

        // Find the data (using the standard query JSON object)
        canvasModel.find( query, (err, docs) => {
        
            // Return the data
            res.json({
                "statusCode": "success",
                "message" : "Retrieve resource: " + resource,
                "data": docs,
                "error": null
            });
        });
    }
    catch (error) {
        res.status(400).json({
            "statusCode": "error",
            "message" : "No model file for resource: " + resource,
            "data": null,
            "error": error
        });
    
        return;
    };

})

// POST route
router.post('/:resource', (req, res, next) => {

    // Extract: body, route (params without :)
    const resource = req.param('resource').substring(1);
    const body = req.body;
    console.log('Router: GET for resource:', resource, 'body:', body)
    console.log('');

    // Try, in case model file does not exist
    try {
        // Get the model dynamically (take note of file spelling = resource)
        const canvasSchema = '../model/' + resource;
        const canvasModel = require(canvasSchema);

        // Create object and save to DB
        let canvasAdd = new canvasModel(body);
        canvasAdd.save()
            .then(doc => {
                console.log('saved', doc)
                res.json({
                    "statusCode": "success",
                    "message" : "Added record for resource " + resource,
                    "data": doc,
                    "error": null
                });         
            })
            .catch(err => {
                console.error(err)
                res.json({
                    "statusCode": "error",
                    "message" : "Error: Could not add record for resource " + resource,
                    "data": null,
                    "error": err
                });         
        });
    }
    catch (error) {
        res.status(400).json({
            "statusCode": "error",
            "message" : "No model file for resource: " + resource,
            "data": null,
            "error": error
        });
    
        return;
    };

});

// Export
module.exports = router;