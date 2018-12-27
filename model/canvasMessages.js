// Model for canvasMessages collection

// Imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const counterModel = require('./counters')

// Schema
const CanvasMessageSchema = new Schema({
    id: Number,                 // Unique ID
    threadID: Number,           // Optional thread - to keep converstations together (later use)
    sender: String,             // UserID who sent message, could also be System (for Alerts)
    sentOn: Date,               // DateTime message was sent
    recipients: [               // Original list of Users, groups are split into users @time
        {
            userID: String,     // UserID of recipient
            readOn: Date,       // dateTime read, null if not read
        }
    ],
    toGroups: [ {type: String} ], // Original list of Groups
    subject: String,            // Message Subject
    body: String,               // Message body
    dashboardID: Number,        // Optional Dashboard linked to this message
    dashboardTabID: Number,     // Optional Tab linked to this message
    url: String,                // Optional url to link to
    replyToMessageID: Number,   // Optional message to which this is a reply

    // At runtime
    iHaveReadThis: Boolean,     // 2nd normal form to make easier, if current user read it
    dashboardName: String,      // Optional, name of linked D
    replySender: String,        // Optional, sender of message to which this is a reply
    replyMessageStart: String,  // Optional, first 50 chars of message to which this is a reply
});

// This pre-hook is called before the information is saved into the database
CanvasMessageSchema.pre('save', function(next) {
    var doc = this;

    // Find in the counters collection, increment and update
    counterModel.findOneAndUpdate(
        {_id: 'canvasMessages.id'},
        {$inc: { seq: 1} },
        { upsert: true, new: true },
        function(error, counter)   {
            if(error) {
                return next(error);
            };

            doc.id = counter.seq;
            next();
        }
    );
});

// Create Model: modelName, schema, collection
const CanvasMessageModel = mongoose.model('canvasMessages', CanvasMessageSchema, 'canvasMessages');
 
// Export
module.exports = CanvasMessageModel;