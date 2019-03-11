module.exports = function sortFilterFieldsAggregate(inputResults, queryObject) {
    // This routines receives an Array and the res.query object, and then returns the data after
    // manipulations, like sorting, filtering, field selection and aggregations.

    try {
        // 1. Extract Query properties: these are used by the Widget to reduce the data block returned
        let results = inputResults;
        let sortObject = queryObject.sortObject;
        let fieldsObject = queryObject.fields;
        let filterObject = queryObject.filterObject;
        let nrRowsToReturn = queryObject.nrRowsToReturn;
        const aggregationObject = queryObject.aggregationObject;

        // 2. If (FILTER_OBJECT) then results = results.filter()
        //    Do this first, to reduce the dataset.  Also, else some fields may be deleted later.
        if (filterObject != null  &&  results != null) {
            filterObject = JSON.parse(filterObject)
            Object.keys(filterObject).forEach( key => {
                // Get the key-value pair
                let value = filterObject[key];
                results = results.filter(r => {
                    return value == r[key];
                });
            });
        };
        console.log('xx post filter', filterObject)
        results.forEach(r => console.log('id', r.id))

        // 3. If (SORT_OBJECT) then results = results.sort()
        // Sort ASC on given field, -field means DESC
        // NB: this is NOT mongoose notation with {field: 1}, it is ONE
        //     field, ie sortObject=-createdOn       

        // TODO - return sortOrder = 1 depending on - in field, see TypeScript
        if (sortObject != null  &&  results != null) {

            // DESC, and take off -
            if (sortObject[0] === "-") {
                sortOrder = 1;
                sortObject = sortObject.substr(1);
                results.sort( (a,b) => {
                    if (a[sortObject] > b[sortObject]) {
                        return -1;
                    };
                    if (a[sortObject] < b[sortObject]) {
                        return 1;
                    };
                    return 0;
                });
            } else {
                results.sort( (a,b) => {
                    if (a[sortObject] > b[sortObject]) {
                        return 1;
                    };
                    if (a[sortObject] < b[sortObject]) {
                        return -1;
                    };
                    return 0;
                });
            };
        };
        console.log('xx post sort', sortObject )
        results.forEach(r => console.log('id', r.id, r.createdOn))

        // 4. If (FIELDS_STRING) then results = results[fields]
        if (fieldsObject != null  && results != null) {

            // Create Array of Fields, un-trimmed
            const fieldsArray = fieldsObject.split(",");
            for (var i = 0; i < fieldsArray.length; i++) {
                fieldsArray[i] = fieldsArray[i].trim();
            };
            console.log('xx fieldsArray', fieldsArray)
            // TODO - must be a better way in TS, or Mongo
            // Loop on keys in Object = row 1, delete field from each element in array if not
            // in fieldsArray
            Object.keys(results[0]).forEach(key => {

                if (parseInt(fieldsArray.indexOf(key)) < 0) {
                    for (var i = 0; i < results.length; i++) {
                        delete results[i][key];
                    };
                };
            });
        };

        // TODO
        // 5. If (AGGREGATION_OBJECT) then results = results.clever-thing
        if (aggregationObject != null) {

        };
        
        // 6. Reduce nr of rows to return: 0 or null means all rows
        if (nrRowsToReturn != 0  &&  nrRowsToReturn != null  &&  results != null) {
            results = results.slice(0, nrRowsToReturn)
        };
        
        // 7. Return
        return {
            error: null, 
            results: results
        };
    }
    catch (error) {
        return {
            error: error, 
            results: null
        };
    };
    
}
