// Ivan, ignore this.  This is to test the dynamic stuffies
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const testsSchema = new Schema({
    companyName: {
        type: String,
        required: true
    }
})

const testsModel = mongoose.model('tests', testsSchema);

module.exports = testsModel;