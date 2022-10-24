const config = require('config');

module.exports = function () {
   //If the jwtPrivateKey is not defined, our auth(login) module will not work!!
   if (!config.get('jwtPrivateKey')) {
      throw new Error('FATAL ERROR: jwtPrivateKey is not defined.')
   }
}