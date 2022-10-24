module.exports = function (handler) {   //This will return a function that has the try catch block
   return async (req, res, next) => {  //Pass the Route handler func to it i.e. the service level logic
      try {
         await handler(req, res);
      } catch (e) {
         next(e);
      }
   };
}