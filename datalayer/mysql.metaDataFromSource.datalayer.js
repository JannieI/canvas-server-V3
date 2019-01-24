module.exports = function metaDataFromSource(dataRow) {
    // This routine creates metaData from a MySQL Source.  Note, MySQL give metadata with
    // DESCRIBE TABLE, but in this case we only have a SQL Statement.  So, we are deducing
    // the structure from the data.
    // TODO - Improve over time

    // Preparation
    let metaDataFields = [];

    // Loop on the data row
    Object.keys(dataRow).forEach( key => {
        // Get the key-value pair
        let value = dataRow[key];

        const fieldName = key;

        let fieldType = typeof key;
        fieldType = fieldType.toLowerCase();

        let fieldLength = 25;
        if (fieldType == 'number') {
            fieldLength = 12;
        };
        metaDataFields.push(
            {
                "fieldName": fieldName,
                "fieldType": fieldType,
                "length": fieldLength,
                "average": null,
                "max": null,
                "median": null,
                "min": null,
                "sum": null
            }
        );
    });

    // Return
    return metaDataFields;
}


