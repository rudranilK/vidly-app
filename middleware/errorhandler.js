const errorLogger = require('../logger/winston');  //Getting the winston logger

module.exports = function (err, req, res, next) {
   errorLogger.error(err.message, err);
   res.status(500).send(`Something Went Wrong`);
}
//Express Error middleware -> A special kind of middleware 
//Added at the last of the middleware queue in index.js( startup/routes.js )