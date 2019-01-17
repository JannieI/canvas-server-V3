const dateAdd = require('../utils/dateAdd.util');

module.exports = function calculateCacheExpiryDate(datasource) {
    // This routines calculates the expiry date in cache for a given Datasource

    let serverExpiryDateTime = new Date();
    serverExpiryDateTime = dataAdd(
        datasource.oldnessMaxPeriodInterval, 
        datasource,oldnessMaxPeriodUnits
    );

    console.log('xx serverExpiryDateTime', typeof serverExpiryDateTime, serverExpiryDateTime)
    return serverExpiryDateTime;
}