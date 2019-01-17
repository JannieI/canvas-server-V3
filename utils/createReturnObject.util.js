// This routine takes input, and creates a Return object in CanvasHttpResponse format.

module.exports = function createReturnObject(
    inputStatusCode, 
    inputReturnMessage, 
    inputDataObject,
    inputTableName,
    inputNrRecordsReturned,
    inputMetadataFields) {

    // Define vars
    let statusCode = 'success';
    if (inputStatusCode != null) {
        statusCode = inputStatusCode;
    };
    let returnMessage = 'An Error occured';
    if (inputReturnMessage != null) {
        returnMessage = inputReturnMessage;
    };
    let dataObject = {};
    if (inputDataObject != null) {
        dataObject = inputDataObject;
    };
    let tableName = {};
    if (inputTableName != null) {
        tableName = inputTableName;
    };
     
    let nrRecordsReturned = {};
    if (inputNrRecordsReturned != null) {
        nrRecordsReturned = inputNrRecordsReturned;
    };
    fields 
    let metadataFields = {};
    if (inputMetadataFields != null) {
        metadataFields = inputMetadataFields;
    };

    // Return an object in CanvasHttpResponse format
    return {
        "statusCode": statusCode,
        "message" : returnMessage,
        "data": dataObject,
        "metaData": {
            "table": {
                "tableName": tableName,
                "nrRecordsReturned": nrRecordsReturned
            },
            "fields": metadataFields
        },
        "error": null
    };

}

