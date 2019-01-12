#!/bin/bash

echo "Starting Canvas Server ..."
export MORGAN_LOGGING=on
export MORGAN_RESOURCE=none

export DEBUG=app.*
export MONGO_PASSWORD=MongoPassword



export MONGO_LOCAL_STARTUP_HOST=127.0.0.1
export MONGO_LOCAL_STARTUP_USER=janniei
export MONGO_LOCAL_STARTUP_PASSWORD=janniei
export MONGO_LOCAL_STARTUP_DATABASE=Canvas
export MONGO_LOCAL_STARTUP_PORT=27017

export MYSQL_LOCAL_STARTUP_HOST=mongodb+srv://cluster0-wnczk.azure.mongodb.net/test
export MYSQL_LOCAL_STARTUP_USER=janniei
export MYSQL_LOCAL_STARTUP_PASSWORD=janniei
export MYSQL_LOCAL_STARTUP_DATABASE=
export MYSQL_LOCAL_STARTUP_PORT=
  
export MONGO_CLOUD_STARTUP_HOST=mongodb+srv://cluster0-wnczk.azure.mongodb.net/test
export MONGO_CLOUD_STARTUP_USER=JannieI
export MONGO_CLOUD_STARTUP_PASSWORD=JannieI
export MONGO_CLOUD_STARTUP_DATABASE=
export MONGO_CLOUD_STARTUP_PORT=

nodemon