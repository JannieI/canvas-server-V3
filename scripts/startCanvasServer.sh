#!/bin/bash

echo "Starting Canvas Server ..."
export MORGAN_LOGGING=on
export MORGAN_RESOURCE=none

export DEBUG=app.*
export MONGO_PASSWORD=MongoPassword
nodemon