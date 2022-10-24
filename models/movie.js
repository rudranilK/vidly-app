const mongoose = require('mongoose');
const Joi = require('joi');
const { genreSchema } = require('./genre');

const movieSchema = new mongoose.Schema({
   title: {
      type: String,
      trim: true,
      required: true,
      minlength: 5,
      maxlength: 100,
      uppercase: true
   },
   genre: {
      type: genreSchema,
      required: true
   },
   numberInStock: {
      type: Number,
      default: 0,
      min: 0,
      max: 255
   },
   dailyRentalRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
   }
});

const Movie = mongoose.model('movie', movieSchema);

function validateMovie(movie) {
   const movieSchema = Joi.object().keys({
      title: Joi.string().trim().min(5).max(100).required(),
      genreId: Joi.objectId().required(),    // Added objectId validation // see index.js|| notes
      numberInStock: Joi.number().integer(),
      dailyRentalRate: Joi.number().precision(2).max(100.0)
   });

   return movieSchema.validate(movie);
}

module.exports.Movie = Movie;
module.exports.validate = validateMovie;
