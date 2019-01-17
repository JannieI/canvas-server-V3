// This routine takes input, and creates an error object.

module.exports = function createErrorObject(inputStatusCode, inputErrorMessage, inputErrorObject) {

    // Define vars
    let statusCode = 'error';
    if (inputStatusCode != null) {
        statusCode = inputStatusCode;
    };
    let errorMessage = 'An Error occured';
    if (inputmessage != null) {
        message = inputmessage;
    };
    let errorObject = {};
    if (inputErrorObject != null) {
        errorObject = inputErrorObject;
    };

    // Return an object in CanvasHttpResponse format
    return {
        "statusCode": statusCode,
        "message" : errorMessage,
        "data": null,
        "error": errorObject
    };

}

