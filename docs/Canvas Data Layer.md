This document describes the Canvas Data Layer used by the clientData router.

## data-layer-function Naming Convention:
The naming convention of the data-layer-function is 
    databaseConnectors/DB.datalayer.js, 
    where DB is the type of source (mysql, postgress, mssql, etc).  
    
## data-layer-function Methods:
Inside each data-layer-function, a number of METHODS are exported.  These are:
    - select
    - insert
    - update
    - delete
    - special
    
    The special methods can be:
    - listDatabases: lists all the databases on the given Database Server
    - listTables: takes as input the database name, and lists all tables in the SQL 
    - database, all the  collections in the Mongo database, all the worksheets in the 
    given Excel workbook, etc.
    - listFields: list all the columns for a given DB and SQL Table, Mongo Collection, Excel 
    worksheet, etc.  Not sure if this will contain metadata as well.

*Note, the case of the methods.*

## data-layer-function Input ##
The data-layer-function is generic and has no DB specific info - all the DB info must
be provided by the calling function.  It takes the following inputs:
- DATABASE_OBJECT is required, and contains all the necessary information to connect to
    the source, including connection options.  Fields required for the different types of
    databases will vary.  Current fields are:
    Required properties:
        host: ie '127.0.0.1',
        user: ie 'janniei',
        password: ie psw,
        database: ie 'mysql',
        
    Optional properties: 
        table name: ie XIS-Trades   
        mysql-connectionLimit 10,  
        mysql-supportBigNumbers true
- TABLE is an optional string with the name of a SQL DB table, or equivalent.  For Mongo 
    it will be Collection, for files (Excel, CSV, etc that resiced on the Server) it 
    will be the full path (folder + filename), for Web tables it will be the URL, for
    services it will be the URL with options.  
- FIELDS is an optional array of fields, ie [field1, field2] that must be extracted.
- QUERY_STRING is an optional string that contains the SQL statement for a SQL database,
    Mongo Query, from:to rows and columns for Excel, etc.  
    Note that either TABLE (and optionally Fields) or QUERY_STRING must be provided.  The 
        data-layer-function will convert TABLE and FIELDS to a QUERY_STRING using the 
        relevant format for the given type of source data.
- SQL_PARAMETERS is optional params for the ? in the SQL

## data-layer-function Steps:##
The data-layer-function has the following steps:
- config database object, using DATABASE_OBJECT info provided
- connects to database
- queries, inserts, updates, deletes, special-methods the data
- return the results (or error)

## Outstanding questions ##
1. How does clientRouter get the DATABASE_OBJECT info:
- from DS, from env params, from a connection table (each DS only has an ID to the )
connection table, which has all the info (and maybe encoded passwords)

2. How and when do we store the data
     1. Load results into the Canvas.clientData collection.  The rational is this:
     - it is easier to do the Transformations on Disc (and we can have seriously large datasets)
     - it is easier to code the filter, sort using standard mongo instructions than Array
     - then the ServerDisc caching is already done
     Cons:
     - performance will be slower as we have a write to DB, and 2nd Query !!!
     - what if we are not allowed to store data on Disc (sensitive)
     - may cause a bottleneck on the server ...
     - still limited by Memory if a dataset is very large

     2. Manipulate the results in Memory:
     - much, much faster
     - performance hit on Server, and huge potential for bottleneck...
