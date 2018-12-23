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
class MongoDatabase {
  constructor() {
    this._connect()
  }
_connect() {
     mongoose.connect(`mongodb://${server}/${database}`, { useNewUrlParser: true, useCreateIndex: true })
       .then(() => {
        debugDev('Database connection successful');
       })
       .catch(err => {
         console.error('Database connection error');
       })
  }
}

// Exports
module.exports = new MongoDatabase()