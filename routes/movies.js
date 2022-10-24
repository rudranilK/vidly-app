const express = require('express');
const router = express.Router();
const { Movie, validate } = require('../models/movie');
const { Genre } = require('../models/genre');
const validateID = require('../models/id');
const auth = require('../middleware/auth');
const adminAccess = require('../middleware/admin');
//Validating mongo DB object id's (Taken from gfg)
//const ObjectId = require('mongoose').Types.ObjectId; ->  ObjectId.isValid()
//mongoose.Types.ObjectId is a class. that can be instantiated also has a static methods e.g. ObjectId.isValid()

router.get('/', async (req, res) => {
   const movies = await Movie
      .find()
      .sort('title')
      .select('title genre.name numberInStock dilyRentalRate');

   res.status(200).send(movies);
});


router.get('/:id', async (req, res) => {
   if (!validateID(req.params.id))
      return res.status(400).send(`Invalid ID!!!`);

   const movie = await Movie
      .findById(req.params.id)
      .select('title genre.name numberInStock dilyRentalRate');

   res.status(200).send(movie);
});


router.post('/', auth, async (req, res) => {
   const { error } = validate(req.body);
   if (error) return res.status(400).send(error.message);

   const movie = await Movie.findOne({ title: req.body.title.toUpperCase() });
   if (movie) return res.status(400).send(`Movie with name: ${req.body.title} already exists!!`);

   const genre = await Genre.findById(req.body.genreId);
   if (!genre) return res.status(400).send(`Genre with ID: ${req.body.genreId} Not Found!!`);

   const newMovie = new Movie({
      title: req.body.title,
      genre: {             //the Genre object may have 50 fields, we only need 2.
         _id: genre._id,
         name: genre.name
      },
      numberInStock: req.body.numberInStock,    //What happens if these fields are undefined
      dailyRentalRate: req.body.dailyRentalRate   //They will be set to default if -> undefined
   });
   await newMovie.save();
   res.status(200).send(newMovie);
});


router.put('/:id', auth, async (req, res) => {
   //Validate the ID
   if (!validateID(req.params.id))
      return res.status(400).send(`Invalid ID!!!`);

   //Validate the payload body
   const { error } = validate(req.body);
   if (error) return res.status(400).send(error.message);

   const genre = await Genre.findById(req.body.genreId);
   if (!genre) return res.status(400).send(`Genre with ID: ${req.body.genreId} Not Found!!`);

   const result = await Movie.findByIdAndUpdate(req.params.id, {
      //mongoDB update operators
      $set: {
         title: req.body.title,
         // genre: genre,  //the Genre object may have 50 fields, we only need 2.
         'genre._id': genre._id,
         'genre.name': genre.name,
         numberInStock: req.body.numberInStock ? req.body.numberInStock : 0,
         dailyRentalRate: req.body.dailyRentalRate ? req.body.dailyRentalRate : 0
      }
   }, { new: true });

   if (!result) res.status(404).send(`Movie with id: ${req.params.id} not found!!`);
   else res.status(200).send(result);
});


router.delete('/:id', auth, adminAccess, async (req, res) => {
   if (!validateID(req.params.id))
      return res.status(400).send(`Invalid ID!!!`);

   const removedMovie = await Movie.findByIdAndRemove(req.params.id);
   if (!removedMovie) res.status(400).send(`Movie with id: ${req.params.id} does not exist!!`);
   else res.status(200).send(`Removed Movie: ${removedMovie}`);
});

module.exports = router;