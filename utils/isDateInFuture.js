// This routines determines if a given DateTime value is in the future
// Returns True if it is the case.
module.exports = function isDateInFuture(dateTime) {

    let dn = new Date();
    let tn = dn.getTime()
    let dl = new Date(dateTime);
    let tl = dl.getTime();
    if (tl >= tn) {
        return true;
    } else {
        return false;
    };
}
