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



    // KEEP !!!
    // This is the code to get /data?id=x from the Mongo data  ~  Disc Caching.
    // It works !!!
    //
    // Try, in case model file does not exist
    // try {
    //     // Get the model
    //     const clientSchema = '../model.model/clientData.model';
    //     const clientModel = require(clientSchema);
    //     debugData('Using Schema clientData');

    //     // Find the data (using the standard query JSON object)
    //     clientModel.find( reqQuery, (err, docs) => {

    //         // Extract metodata from the Schema, using one document
    //         // const oneDoc = clientModel.findOne();

    //         // Empty Array of fields
    //         var fields = [];

    //         // Loop on metatdata
    //         // for (var key in oneDoc.schema.obj) {
    //         //     var value = oneDoc.schema.obj[key];

    //         //     fields.push(
    //         //         {
    //         //             "fieldName": key,
    //         //             "fieldType": value.name,
    //         //             "average": null,
    //         //             "max": null,
    //         //             "median": null,
    //         //             "min": null,
    //         //             "sum": null
    //         //         }
    //         //     );
    //         // };
