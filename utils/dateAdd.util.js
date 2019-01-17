// This routine adds a given interval (ie Hour) and unit (ie 24) to a date

module.exports = function dateAdd(inputDate, interval, units) {
    // Adds an el                                                                                                                                                                                                   ement to a data, similar to ADDDATE SQL-style
    //  - date  Date to start with
    //  - interval  One of: year, quarter, month, week, day, hour, minute, second
    //  - units  Number of units of the given interval to add.
    //  Example: dateAdd(new Date(), 'minute', 30)  //returns 30 minutes from now
    // Returns: Amended Date

    // Get the original
    var returnDate = new Date(inputDate); //don't change original date
    var checkRollover = function() { if(returnDate.getDate() != inputDate.getDate()) returnDate.setDate(0);};
    
    switch(interval.toLowerCase()) {
        case 'year'   :  returnDate.setFullYear(returnDate.getFullYear() + units); checkRollover();  break;
        case 'quarter':  returnDate.setMonth(returnDate.getMonth() + 3*units); checkRollover();  break;
        case 'month'  :  returnDate.setMonth(returnDate.getMonth() + units); checkRollover();  break;
        case 'week'   :  returnDate.setDate(returnDate.getDate() + 7*units);  break;
        case 'day'    :  returnDate.setDate(returnDate.getDate() + units);  break;
        case 'hour'   :  returnDate.setTime(returnDate.getTime() + units*3600000);  break;
        case 'minute' :  returnDate.setTime(returnDate.getTime() + units*60000);  break;
        case 'second' :  returnDate.setTime(returnDate.getTime() + units*1000);  break;
        default       :  returnDate = inputDate;  break;
    };

    // Return date
    return returnDate;
}
