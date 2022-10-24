const mongoose = require('mongoose');
const Joi = require('joi');

const customerSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true,
      uppercase: true,
      minlength: 5,
      maxlength: 50,
      trim: true
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
});

const Customer = mongoose.model('customer', customerSchema);

function validateCustomer(customer) {
   const customerSchema = Joi.object().keys({
      name: Joi.string().trim().min(5).max(50).required(),
      phone: Joi.string().trim().length(10).required().regex(/^[0-9]+$/, { invert: false }),
      isGold: Joi.boolean()
   });

   return customerSchema.validate(customer);
}

module.exports.Customer = Customer;
module.exports.validate = validateCustomer;