const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Rental } = require('../models/rental');
const { Movie } = require('../models/movie');
const moment = require('moment');
const Joi = require('joi');
const validateMiddleware = require('../middleware/validate');
const config = require('config');

// //Used for transactions
// const Fawn = require('fawn');
// const db = config.get('dbConnectionString');

// //Passing the connection string 
// Fawn.init(db);

router.post('/', auth, validateMiddleware(validateReturn), async (req, res) => {

   const rental = await Rental.lookUp(req.body.customerId, req.body.movieId); // static method of Rental class

   if (!rental) return res.status(404).send(`No rental found!`);

   if (rental.dateReturned) return res.status(400).send(`rental already processed!`);

   rental.return();  //Calling instance method of Rental class to calculate the return stuff
   await rental.save();

   await Movie.updateOne({ _id: rental.movie._id }, {     // we can use req.body.movieId as well
      $inc: { numberInStock: 1 }
   });

   //'fawn' - not working
   // new Fawn.Task()
   //    .save('rentals', rental)      //Name of the coll has to be exact i.e. in plural and case sensitive
   //    .update('movies', { _id: rental.movie._id }, { $inc: { numberInStock: 1 } })
   //    //collection name, query obj, update obj
   //    .run();

   return res.send(rental);
});

function validateReturn(payload) {
   const returnSchema = Joi.object().keys({
      customerId: Joi.objectId().required(),    // Added objectId validation // see index.js|| notes
      movieId: Joi.objectId().required()
   });

   return returnSchema.validate(payload);
}

module.exports = router;