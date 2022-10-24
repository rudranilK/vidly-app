const mongoose = require('mongoose');
const Joi = require('joi');

//Defining schema
const genreSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 5,
      maxLength: 50
   }
});

//Modelling schema
const Genre = mongoose.model('genre', genreSchema);

//payload validation logic - Coming from client
function validateGenre(genre) {
   const genreSchema = Joi.object().keys({
      name: Joi.string().min(5).max(50).required()
   });

   return genreSchema.validate(genre);
}

module.exports.Genre = Genre;
module.exports.genreSchema = genreSchema;
module.exports.validate = validateGenre;
