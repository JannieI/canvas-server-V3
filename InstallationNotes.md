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

# dotEnv:
npm install dotenv --save

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


// Native modules
import path from 'path';
import dotenv from 'dotenv';

// Express
import express, { Request, Response } from 'express';
import { NextFunction } from 'connect';
const app = express();

// Import Third party apps
import helmet from 'helmet';

// Helmet is the first thing!
app.use(helmet());

// Initialise the configuration
dotenv.config();
// port is now available to the Node.js runtime 
// as if it were an environment variable
const port = process.env.SERVER_PORT;

// Variables
var user: string = '';
var message: string = '';

// Functions
function validateUser(req: Request, res: Response, next: NextFunction) {
    // Get info out of req object
    // Check against DB
    // Store the answer in the res object
    res.locals.validatedUser = true;
    next();
}

// Statics: Can access all info in this folder:
// 11 Dont need to include public in the path
// 2. Dont need a path for it.
// 3. Can have more than one, just add another app.use
// 4. Public obviously cannot contain sensitive info
// 5. Place under app line
app.use(express.static('public'));

// JSON & URLencoded to create req.body (in right format)
app.use(express.json());
app.use(express.urlencoded( {extended: false }));

// Initial middleware on ALL routes and ALL methods
//  For ONE route: app.use('/admin', validateUser);
//  For ONE method, ALL routes: app.get(validateUser);
app.use(validateUser);

// Query parameters
app.use( (req, res, next) => {
    user = req.query.name?  req.query.name  :  ''; 
    message = req.query.msg?  req.query.msg  :  '';
    console.log(user)
    console.log(message)
    next();
});

// Parameters - looks if any route any method has a :id parameter
app.param('id', (req, res, next, id) => {
    // Store, validate this
    next();
});

// Routes
app.get('/:parameter', (req, res, next) => {
    console.log(req.query, res.locals.validatedUser)
    res.send('Canvas-Server running for parameter: ' 
    + req.params.parameter);

    // res.sendFile(path.join(__dirname + '/public/Photo1.JPG'));
    // res.json({ "name": "Jannie"})
});


app.get('/', (req, res, next) => {
    console.log(req.query, res.locals.validatedUser)
    res.send('Canvas-Server running on port ' + port + 
        ', validated: ' + ' ' + 
        (res.locals.validatedUser!=undefined?  res.locals.validatedUser  :  '') 
        + ' ' + user + ' ' + message);

    // res.sendFile(path.join(__dirname + '/public/Photo1.JPG'));
    // res.json({ "name": "Jannie"})
});

app.all('*', (req, res, next) => {
    res.status(404);
    res.send('<h1 style="color: red;"> Sorry, invalid url </h1>');
});

// Listen on this port for any HTTP traffic
app.listen(8000, () => console.log('Canvas Server is listening on port 8000!'));