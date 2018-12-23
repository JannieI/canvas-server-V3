// Local Database object for Mongo

// Notes from https://medium.freecodecamp.org/introduction-to-mongoose-for-mongodb-d2a7aa593c57:
//
// The require(‘mongoose’) call above returns a Singleton object. It means that the first time 
// you call require(‘mongoose’), it is creating an instance of the Mongoose class and returning it. 
// On subsequent calls, it will return the same instance that was created and returned to you the 
// first time because of how module import/export works in ES6.


let mongoose = require('mongoose');
const server = '127.0.0.1:27017'; 
const database = 'Canvas';      
class MongoDatabase {
  constructor() {
    this._connect()
  }
_connect() {
     mongoose.connect(`mongodb://${server}/${database}`, { useNewUrlParser: true })
       .then(() => {
         console.log('Database connection successful')
       })
       .catch(err => {
         console.error('Database connection error')
       })
  }
}

module.exports = new MongoDatabase()