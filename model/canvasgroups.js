// Ivan, ignore this one - just testing something

const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const CanvasGroupSchema = new Schema({
    id: Number,                             // Unique Group ID
    name: String,                           // Group name
    editedBy: String,                       // Last user who edited this task
    editedOn: Date,                         // Date this task was last edited
    createdBy: String,                      // UserID who created this task, can be System
    createdOn: Date                         // Date task was created
});


// Create Model: modelName, schema, collection
const CanvasGroupModel = mongoose.model('canvasgroups', CanvasGroupSchema, 'canvasgroups');

module.exports = CanvasGroupModel;