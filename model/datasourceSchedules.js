// Model for DashboardSchedules collection

// Imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const counterModel = require('./counters')

// Schema
const DashboardScheduleSchema = new Schema({
    id: Number,
    dashboardID: Number,
    datasourceID: Number,
    name: String,
    description: String,
    repeatFrequency: String,                // Occurs: Daily, Weekly, Monthly, Yearly
    repeatsEvery: Number,                   // Repeats every x of Frequency, ie 2 = every 2nd Month
    weeklyMonday: Boolean,                  // For Weekly: occurs on this weekday
    weeklyTuesday: Boolean,                 // For Weekly: occurs on this weekday
    weeklyWednesday: Boolean,               // For Weekly: occurs on this weekday
    weeklyThursday: Boolean,                // For Weekly: occurs on this weekday
    weeklyFriday: Boolean,                  // For Weekly: occurs on this weekday
    weeklySaturday: Boolean,                // For Weekly: occurs on this weekday
    weeklySunday: Boolean,                  // For Weekly: occurs on this weekday
    monthlyOn: Number,                      // For Monthly: Occurs on this Day of month, ie 13th
    yearlyJanuary: Boolean,                 // For Yearly: Occurs in this month
    yearlyFebruary: Boolean,                // For Yearly: Occurs in this month
    yearlyMarch: Boolean,                   // For Yearly: Occurs in this month
    yearlyApril: Boolean,                   // For Yearly: Occurs in this month
    yearlyMay: Boolean,                     // For Yearly: Occurs in this month
    yearlyJune: Boolean,                    // For Yearly: Occurs in this month
    yearlyJuly: Boolean,                    // For Yearly: Occurs in this month
    yearlyAugust: Boolean,                  // For Yearly: Occurs in this month
    yearlySeptember: Boolean,               // For Yearly: Occurs in this month
    yearlyOctober: Boolean,                 // For Yearly: Occurs in this month
    yearlyNovember: Boolean,                // For Yearly: Occurs in this month
    yearlyDecember: Boolean,                // For Yearly: Occurs in this month
    startsOn: Date,                         // Date
    endsNever: Boolean,                     // True means never ends
    endsAfter: Number,                      // n times, ie 2 means it will run twice
    endsOn: Date,                           // Date

});

// This pre-hook is called before the information is saved into the database
DashboardScheduleSchema.pre('save', function(next) {
    var doc = this;

    // Find in the counters collection, increment and update
    counterModel.findOneAndUpdate(
        {_id: 'dashboardSchedules.id'},
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
const DashboardScheduleModel = mongoose.model(
    'dashboardSchedules', 
    DashboardScheduleSchema, 
    'dashboardSchedules'
);

// Export
module.exports = DashboardScheduleModel;