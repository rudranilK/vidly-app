const express = require('express');
const router = express.Router();
const { User, validate } = require('../models/user');
const auth = require('../middleware/auth');
const _ = require('lodash');
const bcryt = require('bcrypt');

router.post('/', async (req, res) => {
   const { error } = validate(req.body);
   if (error) return res.status(400).send(error.message);

   let user = await User.findOne({ email: req.body.email });
   if (user) return res.status(400).send(`User ${req.body.name} already registered!!`);

   user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
   });
   //Using lodash ->
   // user = new User(_.pick(req.body, ['name', 'email', 'password']));

   //To hash a password, we need a salt
   const salt = await bcryt.genSalt(10);
   user.password = await bcryt.hash(user.password, salt); //Hash the password with the salt

   await user.save();

   //Generate a jwt token, once user registers.
   const token = user.generateAuthToken();

   //res.header('x-auth-token', token) sets our custom header 'x-auth-token' : generated JWT in the response
   res.header('x-auth-token', token).status(200).send(_.pick(user, ['_id', 'name', 'email']));
   //Since this is our custom header, prefix this with 'x-'.
});

//Getting details of the currently logged in User, we don't want the user to pass an ID and get the details of any user; he can only get his own complete details.
router.get('/me', auth, async (req, res) => {
   const user = await User.findById(req.user._id).select(['_id', 'name', 'email']);
   res.status(200).send(user);
});

module.exports = router;