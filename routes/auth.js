const express = require('express');
const router = express.Router();
const { User } = require('../models/user');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const Joi = require('joi');

router.post('/', async (req, res) => {
   const { error } = validate(req.body);
   if (error) return res.status(400).send(error.message);

   let user = await User.findOne({ email: req.body.email });
   if (!user) return res.status(400).send(`Invalid email or password!`);
   //Not sending 404 to let them know we don't have any data with these credentials, just letting them know the authentication failed - not telling them why it failed 

   const validPassword = await bcrypt.compare(req.body.password, user.password);
   //The original salt is added in the password stored in DB, the 'bcrypt.compare()' will retrive the Original salt from the hashed password, re-hash the 'req.body.password' with that salt and then compare both the passwords -> return true/false

   if (!validPassword) return res.status(400).send(`Invalid email or password!`);

   //Creating a Json Web Token to pass to the client side. 
   const token = user.generateAuthToken();
   res.status(200).send(token);
});

function validate(req) {
   const userSchema = Joi.object().keys({
      email: Joi.string().email().min(5).max(50).required(),
      password: Joi.string().min(6).max(50).required()
   });

   return userSchema.validate(req);
}

module.exports = router;