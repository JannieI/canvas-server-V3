
module.exports = function calculateCacheExpiryDate(datasource) {
    // This routines calculates the expiry date in cache for a given Datasource

    const dateAdd = require('./dateAdd.util');
    let serverExpiryDateTime = new Date();
    oldnessMaxPeriodInterval = datasource.oldnessMaxPeriodInterval; 
    oldnessMaxPeriodUnits = datasource.oldnessMaxPeriodUnits;

    serverExpiryDateTime = dateAdd(
        new Date(),
        datasource.oldnessMaxPeriodInterval, 
        datasource.oldnessMaxPeriodUnits
    );

    // TODO - at a later stage, define Relative periods, ie fresh until 8:00am on PreviousWorkingDay
    return serverExpiryDateTime;
}