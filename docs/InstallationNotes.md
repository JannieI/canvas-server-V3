# Notes on how to Install this app

Had difficulty getting TS and Node talking, so I used this link:
- https://codeburst.io/typescript-node-starter-simplified-60c7b7d99e27
  (It does auto transpile of TS and restarts Node when changes are made to TS files:
  - npm run watch-ts : which does "nodemon dist/server.js"
  - in a separate terminal we run: npm run watch-node) : which does "tsc -w" )


## Linking to Git:
1) create a remote git project and note the URL of project
2) open/edit your local git project
3) in the VS terminal type: 
    git push --set-upstream https://github.com/JannieI/canvas-server.git

The standard advice did not work (says remote already exists):
    > git remote add origin https://github.com/<repo owner>/<repo name>.git
    > git push -u origin master

## NB - if you delete a Repository, Git deletes ALL changes !!!

# Express Generator
express canvas-server

# Helmet:
npm install helmet --save

# GitHub Auth0
npm install passport --save
npm install passport-github --save

# Express-Session
npm install express-session --save

# Postgress
npm install pg --save

# MongoDB
npm install mongodb --save

# Install MySQL
npm install mysql --save

# Node Mailer
npm install nodemailer --save

# Google OAuth2
npm install passport-google-oauth20 --save

# Encryption 
npm install bcrypt --save

# Body Parser
npm install body-parser --save

# JWT
npm install jsonwebtoken --save

# Mongoose
npm install mongoose --save

# Passport local Strategy
npm install passport-local --save

# Passport JWT Strategy
npm install passport-jwt --save

# server-favicon
npm install serve-favicon --save

# morgan
npm install morgan --save

# joi
npm install joi 

# config
npm i config

# debug
npm i debug

<!-- -------------MONGO INFO START ------------------------ -->
# Install MongoDB 4.04 - OUTSIDE of Node
See:  https://askubuntu.com/questions/842592/apt-get-fails-on-16-04-or-18-04-installing-mongodb

Did not work as kept old verson:
https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/#begin-using-mongodb

Remove MongoDB databases and log files:
    sudo rm -r /var/log/mongodb
    sudo rm -r /var/lib/mongodb

# Import JSON Array to local DB
mongoimport --host=127.0.0.1  --db Canvas  --collection Canvas --drop --file bgColourImport.json --jsonArray

mongoexport --host=127.0.0.1 --db Canvas --collection Canvas  --out bgColourExport.json --pretty --jsonArray

mongoimport --host cluster0-shard-00-00-wnczk.azure.mongodb.net:27017   --username JannieI --password JannieI  --collection bgColours  --db Canvas  --file bgColourImport.json --jsonArray  --authenticationDatabase admin  --ssl

bash list.txt to import all in txt file

HOST (--host): cluster0-shard-00-00-wnczk.azure.mongodb.net:27017

<!-- ------------------- MONGO ENDS------------------------ -->


