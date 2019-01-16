module.exports = function metaDataFromDatasource(datasource) {
    // This routine creates metaData from a given Datasource

    let fields = [];
    
    // Cater for the other Arrays being out of sync
    if (datasource.dataFields == null) {
        datasource.dataFields = [];
    };
    if (datasource.dataFieldTypes == null) {
        datasource.dataFieldTypes = [];
    };
    if (datasource.dataFieldLengths == null) {
        datasource.dataFieldLengths = [];
    };

    // Loop on metatdata
    for (var i = 0; i < datasource.dataFields.length; i++) {
        const fieldName = datasource.dataFields[i];

        let fieldType = '';
        if (i < datasource.dataFieldTypes.length) {
            fieldType = datasource.dataFieldTypes[i];
        };

        let fieldLength = '';
        if (i < datasource.dataFieldLengths.length) {
            fieldLength = datasource.dataFieldLengths[i];
        };

        fields.push(
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

    // Return
    return fields;

}