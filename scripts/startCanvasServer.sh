#!/bin/bash

echo "Starting Canvas Server ..."
export morgan=on
export DEBUG=app.*
export MONGO_PASSWORD=MongoPassword
nodemon