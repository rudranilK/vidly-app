module.exports = (req, res, next) => {
   if (!req.user.isAdmin) return res.status(403).send('Unauthorized Admin Access Denied!');
   next();
}
//No need to check req.user.isAdmin -> exists or not.
// as req.user.isAdmin = undefined -> if(!req.user.isAdmin) == still be true in that case