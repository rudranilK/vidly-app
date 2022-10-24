const Joi = require('joi');

module.exports = (id) => {
   const idSchema = Joi.objectId().required();
   const { error } = idSchema.validate(id);
   return error ? false : true;
}