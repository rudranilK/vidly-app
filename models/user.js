const Joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');

const userSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 5,
      maxLength: 50
   },
   email: {
      type: String,
      required: true,
      unique: true,  //This makes sure that 2 documents won't have same value for email
      trim: true,
      lowercase: true,
      minlength: 5,
      maxLength: 50
   },
   password: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      maxLength: 1024   //Setting it this much as we will hash the password
   },
   isAdmin: {
      type: Boolean,
      default: false
   }//Even if the document doesn't have isAdmin property , mongoose will set it to false during retival from DB

   // isAdmin: Boolean // This will not set the isAdmin = false, if the document doesnt have that field
});

userSchema.methods.generateAuthToken = function () {
   const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, config.get('jwtPrivateKey'));
   return token;
}

const User = mongoose.model('user', userSchema);

function validateUser(user) {
   const userSchema = Joi.object().keys({
      name: Joi.string().min(5).max(50).required().alphanum(),
      email: Joi.string().email().min(5).max(50).required(),
      password: Joi.string().min(6).max(50).required()
   });

   return userSchema.validate(user);
}

module.exports.User = User;
module.exports.validate = validateUser;