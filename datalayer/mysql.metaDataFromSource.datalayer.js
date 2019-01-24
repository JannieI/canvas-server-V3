module.exports = function metaDataFromDatasource(dataRow) {
    // This routine creates metaData from a MySQL Source.  Note, MySQL give metadata with
    // DESCRIBE TABLE, but in this case we only have a SQL Statement.  So, we are deducing
    // the structure from the data.
    // TODO - Improve over time

    // Preparation
    let metaDataFields = [];

    // Create Array of Fields, un-trimmed
    if (fieldsObject != null) {
        fieldsObject = JSON.parse(JSON.stringify(fieldsObject));

        // Un-trim
        fieldsArray = fieldsObject.split(",");
        for (var i = 0; i < fieldsArray.length; i++) {
            fieldsArray[i] = fieldsArray[i].trim();
        };

    };

    // Loop on given data row
    for (var i = 0; i < dataRow.length; i++) {
        const fieldName = dataRow[i];

        let fieldType = typeof dataRow[i];
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
    };
    console.log('xx metaDataFields', metaDataFields)

    // Return
    return metaDataFields;
}


