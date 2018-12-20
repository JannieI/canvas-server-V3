// Ivan, ignore this.  This is to test the dynamic stuffies
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const testSchema2 = new Schema({
    companyName: {
        type: String,
        required: true
    }
})

const testModel2 = mongoose.model('testSchema2', testSchema2);

module.exports = testModel2;