const mongoose = require('mongoose');
const winston = require('../logger/winston');
const config = require('config');

module.exports = function () {

   const db = config.get('dbConnectionString');

   //Connecting to mongoDB
   mongoose.connect(db)
      .then(() => {
         // throw new Error('Could not connect to mongoDB');
         winston.log('info', `Connected to '${db}'`);
      });

   // .catch((err) => console.error('Could not connect to mongoDB', err));
   //This will be handled by the 'unhandledRejection' eventlistner
}