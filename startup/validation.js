//To add objectId validation in joi package -> here we load it once to use it everywhere in app
const Joi = require('joi');

module.exports = function () {
   Joi.objectId = require('joi-objectid')(Joi);
   //When we load this module in index, the objectId method is added to it and then when we require it in model layer, it comes with the added method.
}



