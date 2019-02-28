# Specification of the REST API endpoints provided by Canvas Server

This file describes the REST API endpoints provided by the Canvas Server, and consumed by the Canvas Workstation.  Catering for the future, so it is assumed that third parties will consume these as well.

## Methods

Each endpoint will support CRUD operations via the standard HTTP methods: GET, PUT, POST and DELETE.  There may be some exceptions to this, for example: it may not make sense to update (PUT) or delete (DELETE) from the audit trail files as these should be immutable (so, only GET and POST methods will be created).


## General format

There are 3 types or families of API calls:
1. login and authentication (to be discussed in detail at a later stage)
2. client data, like XIS trades (to be discussed later)
3. Canvas-related data, like dashboards and widgets.

*Note: my naming of these elements inside the url may not be perfect; feel free to improve!*


#### Authentication-related API calls:

The general format of each authentication-related API call is:

    HTTP-Method {{ host }} / auth / {{ provider-name }} / {{ function }}

    WHERE
        HTTP-Method - GET, PUT, POST, DELETE 
        {{ host }} - the url for the Canvas Server, which could be http://localhost:8000 for the local server running Node & Express.
        auth - fixed part of the route indicating that it is authentication-related
        {{ provider-name }} - provide of authentication service.  Currently we have Google, GitHub and Local.  Local indicates that authentication is provided by the Canvas Server itself, in which case a user-id and password must be provided.
        {{ function }} - can be login, verify, signup (to registr a new user).


#### Client data-related API calls:

The general format of each client data-related API call is:

    HTTP-Method {{ host }} / clientdata / ?query-string

    WHERE
        HTTP-Method - GET, PUT, POST, DELETE 
        {{ host }} - the url for the Canvas Server, which could be http://localhost:8000 for the local server running Node & Express.
        data - fixed part of the url
        query-string - specifies the data block that must be returned:
            - ?datasourceID=x is required, and identifies the Datasource, which will contain information about the data (location, type of database, etc)
            - sort=SORT_OBJECT is optional, and specifies how the data must be sorted prior to returning to Workstation.  SORT_OBJECT could be { name:1, user: -1} where 1 and -1 indicates ascending and descending respetively.   These should mimic Mongo style sorting.
            - fields=FIELDS_STRING is optional, and indicates which fields must be returned.  For example, FIELDS_STRING=name,user will only return these two fields in the data block.
            - filters=FILTER_OBJECT is optional, and specifies how rows must be filtered before the data block is returned.  For example, FILTER_OBJECT = { name: {eq: 'JohnS' }} will only return records for JohnS.  These should mimic Mongo style filters.
            - aggregate=AGGREGATION_OBJECT is optional, and indicates how the data must be aggregated before the data block is returned.  For example, AGGREGATION_OBJECT = { sum: Field1, groupby: Field2, having: {eq: field3} }.   These should mimic Mongo style projection.  Note: the sort, filters, fields runs pre-aggregation in all cases.  For now, aggregation is a single object, so post-aggregation filter (having) and sorting must be done in the AGGREGATION_OBJECT.  This is a cleaner design as aggregation is one action.

#### Canvas-related API calls:

The general format of each Canvas-related API call is:

    HTTP-Method {{ host }} / canvasdata / {{ :resource-name }} ?query-string

    WHERE:
        HTTP-Method - GET, PUT, POST, DELETE 
        {{ host }} - the url for the Canvas Server, which could be http://localhost:8000 for the local server running Node & Express.
        canvasdata - fixed portion of the route
        {{ :resource-name }} - a value from the list of resources provided below, ie dashboards, widgets, etc.
        ?query-string - optional string that specifies further qualification of what must be returned.  It consists of:
        - identification of a specific resource required.  There are two formats allows: id=x  or  { query-object}, where query-object is in Mongoose query filter format, ie { id: 1 }.  The reason that id=1 works, is because Express converts it to the desired Mongoose query filter format.  For example, when deleting a record, one has to identify the record, for example ?id=1.  When adding a new record this is not filled in.  
        - *sorting of the result, in Mongoose format
        - *fields to be returned, in Mongoose projection format
        - *aggregation of the result, in Mongoose aggregation format
        
        * these are planned, but not finalised.  More to follow later once we have actually coded it.


*Notes:*
*1. The body of the request contains the data that the browser sends to the server.  This data will be the complete new record when adding, or the changed record when updating.  The GET and DELETE methods do not have a body.*
*2. Below is an example of each method, using the canvasGroups resource.  The format of the instructions are as per the VSCode REST extention, but can easily be trannslated into curl.*


## Return values
Each HTTP-method returns a JSON object according to the following model specified in Canvas Workstation:

```
    export class CanvasHttpResponse {
        "statusCode": string;                   // Returned from server: failed, success,
                                                   error
        "resourceOrRoute": string;              // Client requested
        "message" : string;                     // Text message
        "data": any;                            // Data returned, ie Json Array
        "metaData"?: {                          // Optional meta data
        "table"?: {                             // Table properties
            "tableName": string;
            "nrRecordsReturned": number;
        },
        "fields"?: {                            // Array of fields, each with properties
            "fieldName": string;
            "fieldType": string;
            "average": number;
            "max": number;
            "median": number;
            "min": number;
            "sum": number;
        }[]
    }
        "error": any;                           // Error message, else null
        "token"?: string;                       // Token, only provided by Login
    }
```

The statusCode is an internal status code, and does not refer to the HTTP status (ie 200, 404).  The idea is that a request can be valid in terms of HTTP (thus a 200), but something is not acceptable to Canvas Server.  In thus case, it will send back a 'failed' statusCode.  Not sure if we really need this.

The resourceOrRoute indicates what was originally requested by the Client.  For canvasData is will be a single resource, ie dashboards.  For compound routes the http-route (ie DiscardDashboard) is inserted here.

Errors must contain a full Error Object, with a message property.  This property will be used by Workstation to display a user-friendly text message.

The data property in the above object depends on the method:
- GET: array of JSON objects returned from Mongo
- PUT: JSON object of the record (document in Mongo) after it was amended
- POST: JSON object of the record that was added.  This will contain the database id for the new record, which is needed by Canvas Workstation.  *TODO - do we use Mongo' IDs, or do we do we continue with the existing format.*
- DELETE: JSON object of the record that was deleted.

When there is no data (ie the table / collection is empty in a GET method), the data will be an empty array [].  It will never be null, else Canvas Workstation has to make an additional check.

## Examples
### GET
Return an array of JSON objects for all the canvasGroups in the Mongo database where the name is 'Engineering':
```
    GET {{host}}/canvasdata/:canvasGroups?name=Engineering
```

### PUT
Update the name property for the canvasGroup record with id = 4:
```
    PUT {{host}}/canvasdata/:canvasGroups?id=4
    content-type: application/json

    {
        "name": "AN Other Engineering"
    }
```

### POST
Add a new canvasGroup with the data supplied in the body of the request:
```
    POST {{host}}/canvasdata/:canvasGroups
    content-type: application/json

    {
        "id": 14,
        "name": "Engineering"
    }
```

### DELETE
Delete canvasGroup with id = 14:
```
    DELETE {{host}}/canvasdata/:canvasGroups?id=14
```

## List of resources
Below is a list of resources.  Note that the spelling of these are importants, as it links to the following:
- Canvas Workstation makes an HTTP call using this
- the models in Canvas Server must be have the same file names
- the Mongo Collections must have the same collection names.

This list is not exhaustive, but will remain unchanged until we do the redesign:

### System related:        
    canvasAuditTrails
    canvasBackgroundcolorsDefault
    canvasBackgroundcolors
    canvasComments
    canvasGroups
    canvasMessages
    canvasSettings
    canvasTasks
    canvasUsers
    containerStyles
    dataCachingTable
    paletteButtonBars
    paletteButtonsSelecteds
    statusBarMessageLogs
    transformations (list of all available transformations)

### Dashboard-related:    
    dashboardPermissions
    dashboards
    dashboardSchedules
    dashboardScheduleLog
    dashboardSubscriptions
    dashboardSnapshots
    dashboardTabs
    dashboardTags
    dashboardThemes
    dashboardLayouts
    dashboardsRecent

### Client data related:
    dataOwnerships
    dataQualityIssues
    datasets
    data
    dataConnections
    dataTables
    dataFields

### Datasource-related:
    datasourcePermissions
    datasourceSchedules
    datasourceScheduleLog
    datasources
    datasourceTransformations

### Widget-related:
    widgets
    widgetCheckpoints
    widgetGraphs
    widgetLayouts
    widgetStoredTemplates

