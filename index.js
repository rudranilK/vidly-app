const express = require('express');
const app = express();
const winston = require('./logger/winston');    //Load the winston logger

require('./startup/logging')(); //Setting up winston and exception handling
require('./startup/routes')(app); //Adding our routes
require('./startup/mongoDB')();  //Connecting to mongoDB
require('./startup/config')();   //Checking essential configuration settings
require('./startup/validation')(); //Adding objectID to Joi validation 
require('./startup/prod')(app);  // Middlewares that we need in production

// throw new Error('Something failed during startup');

const portNo = process.env.PORT || 3000;
const server = app.listen(portNo, () => winston.log('info', `Listning on port ${portNo}`));

module.exports = server;

