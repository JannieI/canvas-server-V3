#!/bin/bash

echo "Mongo LOCAL Server on  --dbpath ~/Projects/canvas-mongoDB"
echo " (ready when showing:  waiting for connections ..."
sudo mongod --dbpath ~/Projects/canvas-mongoDB
echo "Goodbye !"
