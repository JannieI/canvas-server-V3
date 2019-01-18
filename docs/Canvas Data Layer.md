This document describes the Canvas Data Layer used by the clientData router.

## data-layer-function Naming Convention:
The naming convention of the data-layer-function is 
    datalayer/DB.METHODS.datalayer.js, 
        where DB is the type of source (mysql, postgress, mssql, etc).  
        and METHODS are:
            - getClientData
            - listDatabases: lists all the databases on the given Database Server
            - listTables: takes as input the database name, and lists all tables in the SQL database, all the  collections in the Mongo database, all the worksheets in the 
            given Excel workbook, etc.
            - listFields: list all the columns for a given DB and SQL Table, Mongo Collection, Excel 
            worksheet, etc.  Not sure if this will contain metadata as well.

*Note, the case of the methods.*

## data-layer-function Input ##
The data-layer-function is generic and has no DB specific info - all the DB info must
be provided by the calling function.  It takes the following inputs:
- datasource describes the data that is collected
- QUERY_OBJECT is an optional object that contains the req.queryparams object.

## data-layer-function Steps:##
The data-layer-function has the following steps:
- config database object, using DATABASE_OBJECT info provided
- connects to database
- queries, special-methods the data
- sortFilterFieldsAggregate to Widget specification
- determines metadata
- return the results (or error)

## Outstanding questions ##
1. How and when do we store the data
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
