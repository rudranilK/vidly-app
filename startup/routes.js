const express = require('express');
const genres = require('../routes/genres');
const customers = require('../routes/customers');
const movies = require('../routes/movies');
const rentals = require('../routes/rentals');
const returns = require('../routes/returns');
const users = require('../routes/users');
const auth = require('../routes/auth');
const errorhandler = require('../middleware/errorhandler');
const morgan = require('morgan');

module.exports = function (app) {
   app.use(express.json());
   app.use(express.urlencoded({ extended: false }));

   //Logging incoming requests in dev environment
   if (app.get('env') === 'development') {
      app.use(morgan('tiny'));
      console.log('Morgan enabed...');
   }

   app.get('/', (req, res) => {
      res.send('Hello From Vidly');
   });
   //Incoming request with url '/vidly.com/api/<field>' will be redirected to the routers
   app.use('/vidly.com/api/genres', genres);
   app.use('/vidly.com/api/customers', customers);
   app.use('/vidly.com/api/movies', movies);
   app.use('/vidly.com/api/rentals', rentals);
   app.use('/vidly.com/api/returns', returns);
   //User Registration
   app.use('/vidly.com/api/users', users);
   app.use('/vidly.com/api/auth', auth);

   //This is our error handler -> added at the last of the middleware queue
   app.use(errorhandler);
}