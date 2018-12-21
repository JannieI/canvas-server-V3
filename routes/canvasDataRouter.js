// All Canvas (application-specific) data routes
const express = require('express');
const passport = require('passport');
const router = express.Router();
const Joi = require('joi');

const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/Canvas');
mongoose.connection.on('error', error => console.log('Mongoose Connection error: ',error) );
mongoose.Promise = global.Promise;


const UserModel = require('../model/models');
const Schema = mongoose.Schema;



const testSchema = new Schema({
    companyName: {
        type: String,
        required: true
    }
})

function validateCourse(course) {

	// Schema of what to validate
	const schema = {
		name: Joi.string().min(3).required()
	};

	return Joi.validate(course, schema);
}

// Verify User as valid (exists in Canvas DB)
router.get('/:resource', (req, res, next) => {
    console.log('Router: GET ')
    console.log('')
    const path = req.param('resource').substring(1)
    const query = req.query;
    console.log('xx ', req.query, query, req.params, path)

    const { error } = validateCourse(req.body);
    if (error) {
        res.status(400).send(error.details[0].message);
        return;
    };
    
    const schemaPath1 = '../model/' + path;
    const theSchema1 = require(schemaPath1);
    theSchema1.find( query, (err, docs) => {
        console.log('MAGIC !', docs)
        res.send( 
            {
                message: "It works!",
                data: docs
            }
        );
    });

    // Works
    // const schemaPath1 = '../model/testSchema1';
    // const theSchema1 = require(schemaPath1);
    // theSchema1.find({}, (err, docs) => {
    //     console.log('MAGIC !', docs)
    // });

    // const schemaPath2 = '../model/testSchema2';
    // const theSchema2 = require(schemaPath2);
    // theSchema2.find({}, (err, docs) => {
    //     console.log('MAGIC !', docs)
    // });


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