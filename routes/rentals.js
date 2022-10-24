const express = require('express');
const router = express.Router();
const validateID = require('../models/id');
const { Rental, validate } = require('../models/rental');
const { Customer } = require('../models/customer');
const { Movie } = require('../models/movie');
const auth = require('../middleware/auth');

//Used for transactions
const Fawn = require('fawn');

// const mongoose = require('mongoose');
// const ObjectId = mongoose.Types.ObjectId;

//It is a class, has an initialise method where we have to pass the mongoose object
// Fawn.init(mongoose);

//Passing the connection string as passing the mongoose instance isn't working. 
Fawn.init('mongodb://localhost/vidly');

router.get('/', async (req, res) => {
   const rentals = await Rental.find().sort('-dateout customer.name ');
   res.status(200).send(rentals);
});


router.get('/:id', async (req, res) => {
   if (!validateID(req.params.id))
      return res.status(400).send(`Invalid ID!!!`);

   const rental = await Rental.findById(req.params.id);
   if (!rental) res.status(404).send(`Rental record with id : ${req.params.id} not found!`);
   else res.status(200).send(rental);
});


router.post('/', auth, async (req, res) => {
   const { error } = validate(req.body);
   if (error) return res.status(400).send(error.message);

   const customer = await Customer.findById(req.body.customerId);
   if (!customer) return res.status(400).send(`Customer with ID: ${req.body.customerId} not found!`);

   const movie = await Movie.findById(req.body.movieId);
   if (!movie) return res.status(400).send(`Movie with ID: ${req.body.movieId} not found!`);

   if (movie.numberInStock === 0)
      return res.status(400).send(`Movie not in stock!`);

   const rental = await Rental.findOne({
      'customer._id': customer._id,
      'movie._id': movie._id
   });

   if (rental) return res.status(400).send(`Rental record already exists for Customer : ${customer.name}!`);

   let rentalRecord = new Rental({
      customer: {
         _id: customer._id,
         name: customer.name,
         phone: customer.phone,
         isGold: customer.isGold
      },
      movie: {
         _id: movie._id,
         title: movie.title,
         dailyRentalRate: movie.dailyRentalRate
      }
      // , //These have tyo be set from server side , not from client side
      // dateOut: req.body.dateOut,
      // dateReturned: req.body.dateReturned,
      // rentalFee: req.body.rentalFee
   });

   //Create a task object which is like a transaction -> instead of save + update
   new Fawn.Task()
      .save('rentals', rentalRecord)      //Name of the coll has to be exact i.e. in plural and case sensitive
      .update('movies', { _id: movie._id }, { $inc: { numberInStock: -1 } })
      //Pass collection name, query obj, update obj
      // .remove('coll', {query obj})  //You can chain multiple operations -> treat them as atomic
      .run();   //This runs the transaction - without this none will trigger

   res.status(200).send(rentalRecord);
});


module.exports = router;