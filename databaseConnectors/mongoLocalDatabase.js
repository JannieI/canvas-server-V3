// Local Database object for Mongo

// Notes from https://medium.freecodecamp.org/introduction-to-mongoose-for-mongodb-d2a7aa593c57:
//
// The require(‘mongoose’) call above returns a Singleton object. It means that the first time
// you call require(‘mongoose’), it is creating an instance of the Mongoose class and returning it.
// On subsequent calls, it will return the same instance that was created and returned to you the
// first time because of how module import/export works in ES6.

// Import modules
let mongoose = require('mongoose');
const debugDev = require('debug')('app:dev');

// Constants
// TODO - this must be read from ENV
const server = '127.0.0.1:27017';
const database = 'Canvas';

// Note from Mongoose docs/deprecations.html: Mongoose's findOneAndUpdate() long pre-dates the MongoDB 
// driver's findOneAndUpdate() function, so it uses the MongoDB driver's findAndModify() function 
// instead. You can opt in to using using the MongoDB driver's findOneAndUpdate() function using the 
// useFindAndModify global option.

// By default, Mongoose 5.x calls the MongoDB driver's ensureIndex() function. The MongoDB driver 
// deprecated this function in favor of createIndex(). Set the useCreateIndex global option to opt in
// to making Mongoose use createIndex() instead.

// DeprecationWarning: collection.remove is deprecated. Use deleteOne, deleteMany, or bulkWrite instead.
// To remove this deprecation warning, replace any usage of remove() with deleteMany(), unless you 
// specify the single option to remove(). The single option limited remove() to deleting at most one 
// document, so you should replace remove(filter, { single: true }) with deleteOne(filter).

// Cloud MongoDB:
// Owner: Jimmelman@gmail.com
// PSW: JxX7Krw.-ZDj4Qd

// User: JannieI (my login)
// PSW: J...I (JSE login ID) 

// URI Shell 3.6: mongo "mongodb+srv://cluster0-wnczk.azure.mongodb.net/test" --username JannieI

// Browser: https://cloud.mongodb.com/v2/5bff91d89ccf64766173a1a1#clusters

class MongoDatabase {
    constructor() {
        this._connect()
    }
_connect() {
    mongoose.connect(`mongodb://${server}/${database}`, { useNewUrlParser: true, useCreateIndex: true })
        .then(() => {
            mongoose.set('useFindAndModify', false);
            mongoose.set('useCreateIndex', true);
            debugDev('Database connection successful');
        })
        .catch(err => {
            console.error('Database connection error');
        })
    }
    
}

// Exports
module.exports = new MongoDatabase()