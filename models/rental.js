const mongoose = require('mongoose');
const Joi = require('joi');
// Joi.objectId = require('joi-objectid')(Joi);
//require the joi-objectid; that is a function, calling it with the instance of Joi, which returns another function which we then attach to the Joi constant; so objectid is a method on the Joi object
const moment = require('moment');

const rentalSchema = new mongoose.Schema({
   customer: {
      type: new mongoose.Schema({
         name: {
            type: String,
            trim: true,
            required: true,
            minlength: 5,
            maxlength: 50,
            uppercase: true
         },
         phone: {
            type: String,
            required: true,
            minlength: 10,
            maxlength: 10,
            trim: true
         },
         isGold: {
            type: Boolean,
            default: false
         }
      }),
      required: true
   },
   movie: {
      type: new mongoose.Schema({
         title: {
            type: String,
            trim: true,
            required: true,
            minlength: 5,
            maxlength: 100,
            uppercase: true
         },
         dailyRentalRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
         }
      }),
      required: true
   },
   dateOut: {
      type: Date,
      required: true,
      default: Date.now
   },
   dateReturned: {
      type: Date
   },
   rentalFee: {
      type: Number,
      min: 0
   }
});

rentalSchema.statics.lookUp = function (customerId, movieId) {
   return this.findOne({
      'customer._id': customerId,
      'movie._id': movieId
   });;
}

rentalSchema.methods.return = function () {
   //Sets the dateReturned property and calculates the rentalFee
   this.dateReturned = new Date();

   const rentalDays = moment().diff(this.dateOut, 'days');
   this.rentalFee = rentalDays * this.movie.dailyRentalRate;
}

const Rental = mongoose.model('rental', rentalSchema);

function validateRental(rentalObj) {
   const rentalSchema = Joi.object().keys({
      customerId: Joi.objectId().required(),
      movieId: Joi.objectId().required()
   });
   //dateOut,dateReturned,rentalFee will be set from the server, not from the client side

   return rentalSchema.validate(rentalObj);
}

module.exports.Rental = Rental;
module.exports.validate = validateRental;



