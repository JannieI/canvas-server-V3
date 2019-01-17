module.exports = function calculateCacheExpiryDate(datasource) {
    // This routines calculates the expiry date in cache for a given Datasource

    let serverExpiryDateTime = new Date();
    "oldnessMaxPeriodInterval" : "hour",
    "oldnessMaxPeriodUnits" : 24,
    "oldnessRelatedDate" : "",
    "oldnessRelatedTime" : "",

    let tn = dn.getTime()
    let dl = new Date(dateTime);
    let tl = dl.getTime();
    if (tl >= tn) {
        return true;
    } else {
        return serverExpiryDateTime;
    };
}