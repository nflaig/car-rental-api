const config = require("config");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Joi = require("joi");
const PasswordComplexity = require("joi-password-complexity");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 5,
    maxlength: 255
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 60,
    maxlength: 60
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});

userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email,
      isAdmin: this.isAdmin
    },
    config.get("JWT_PRIVATE_KEY")
  );
  return token;
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = {
    name: Joi.string()
      .regex(/^[a-zA-Z0-9 ,.'-]+$/)
      .min(5)
      .max(50)
      .required(),
    email: Joi.string()
      .email()
      .min(5)
      .max(255)
      .required(),
    password: Joi.string()
      .min(8)
      .max(255)
      .required()
  };

  let result = Joi.validate(user, schema);
  if (!result["error"]) result = validatePassword(user.password);

  return result;
}

function validatePassword(password) {
  const complexityOptions = {
    min: 8,
    max: 255,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 3
  };

  return Joi.validate(password, new PasswordComplexity(complexityOptions));
}

exports.User = User;
exports.validate = validateUser;
