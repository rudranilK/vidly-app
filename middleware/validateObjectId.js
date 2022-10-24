const validate = require('mongoose').Types.ObjectId.isValid;

module.exports = function (req, res, next) {
   if (!validate(req.params.id))
      return res.status(404).send('Invalid ID!!');

   next();
}