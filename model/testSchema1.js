// Ivan, ignore this.  This is to test the dynamic stuffies
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const testSchema1 = new Schema({
    companyName: {
        type: String,
        required: true
    }
})

const testModel1 = mongoose.model('testSchema1', testSchema1);

module.exports = testModel1;