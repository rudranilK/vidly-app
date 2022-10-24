require('express-async-errors');
const errorLogger = require('../logger/winston');    //Load the winston logger
const winston = require('winston');

module.exports = function () {

   // process.on('uncaughtException', (ex) => {
   //    errorLogger.log('error', ex.message);
   //    setTimeout(() => {
   //       process.exit(1);  //We can use an exit handler here to close the mongoDB connection before exiting
   //    }, 1000);
   // });

   // process.on('unhandledRejection', (ex) => {
   //    errorLogger.error(ex.message, ex);
   //    setTimeout(() => {
   //       process.exit(1);
   //    }, 1000);
   // });

   //We can use 'Winston' to catch 'uncaughtException's and log them into a different file.
   // const winston = require('winston');
   //This will log it in the console as well. If u don't want it just remove the console transport

   errorLogger.exceptions.handle(
      new winston.transports.File({ filename: 'logs/uncaughtExceptions.log' }),
      new winston.transports.Console()
   );

   process.on('unhandledRejection', (ex) => {
      throw ex;
   });

}