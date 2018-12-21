// Router for All Canvas (application-specific) data routes

// Imports
const express = require('express');
const passport = require('passport');
const router = express.Router();
const Joi = require('joi');
const mongoose = require('mongoose');

// Configure Mongoose
// TODO - this should be done once
// TODO - do we need the .Promise?
mongoose.connect('mongodb://127.0.0.1:27017/Canvas');
mongoose.connection.on('error', error => console.log('Mongoose Connection error: ',error) );
mongoose.Promise = global.Promise;

// Validate route
function validateRoute(course) {

	// Schema of what to validate
	const schema = {
		resource: Joi.string().min(3).required()
	};

	return Joi.validate(course, schema);
}
 
// GET route
router.get('/:resource', (req, res, next) => {

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

    // Extract: query, route (params without :)
    const resource = req.param('resource').substring(1)
    const query = req.query;
    console.log('Router: GET for resource', resource, 'query', query)
    console.log('')

    // Validate
    const { error } = validateRoute(req.params);
    if (error) {
        // res.status(400).send(error.details[0].message);
        res.status(400).json({
            "statusCode": "error",
            "message" : error.details[0].message,
            "data": null,
            "error": err
        });
    
        return;
    };

    // Get the model dynamically (take note of file spelling = resource)
    // Try, in case model file does not exist
    try {
        const canvasSchema = '../model/' + resource;
        const canvasModel = require(canvasSchema);

        // Find the data (using the standard query JSON object)
        canvasModel.find( query, (err, docs) => {
        
            // Return the data
            res.json({
                "statusCode": "success",
                "message" : "Retrieve resource " + resource,
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
    }

})


// POST route
router.post('/:resource', (req, res, next) => {
    console.log('Router: GET ')
    console.log('')
    const path = req.param('resource').substring(1)
    const query = req.query;
    console.log('xx ', req.query, query, req.params, path)

    // Validate



    console.log('---------------------------------------')



    // Works
    // const useThisSchema = 'testSchema'
    // var testModel = mongoose.model('test', testSchema);

    // testCompanyName = 'Ryan'

    // if (testCompanyName == 'Brie') {
    //     let rec = new testModel({
    //         companyName: testCompanyName
    //     })
    //     rec.save()
    //         .then(doc => {
    //         console.log('saved', doc)
    //         testModel.find( {query} , (err, user) => {
    //             console.log('found', err, user)
    //         });

    //         })
    //         .catch(err => {
    //         console.error('err', err)
    //         })
    // };




    // Works Find according to the query, unparsed
    // testModel.find( query , (err, user) => {
    //     console.log('test Listing', user)
    // });



    username = 'JannieI'
    
    // Determine if user already exists in the database
    // var authColl = db.getCollection("auth")
    // authColl.update ...console


    // Works
    // UserModel.find( { companyName: 'Clarity Analytics', userID: username }, 
    //     (err, user) => {
    //     if (err) {
    //         console.log('err: ', err);

    //         // // Create a new user record since it does not exist
    //         // var newUser = UserModel({
    //         //     companyName: 'Clarity Analytics',
    //         //     userID: username,
    //         //     email: username + '@clarityanalytics.xyz',
    //         //     password: password,
    //         //     createdBy: '',
    //         //     createdOn: null,
    //         //     updatedBy: '',
    //         //     updatedOn: null

    //         // });


    //     } else {;            
    //         // User found
    //         console.log('success user: ', user);
    //     };
    // });

    // res.send( 
    //     {
    //         message: "It works!"
    //     }
    // );
});


// Export
module.exports = router;