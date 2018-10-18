const mongoose = require("mongoose");
const Joi = require("joi");

const Type = mongoose.model(
  "Type",
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 50
    }
  })
);

function validateType(type) {
  const schema = {
    name: Joi.string()
      .min(1)
      .max(50)
      .required()
  };

  return Joi.validate(type, schema);
}

exports.Type = Type;
exports.validate = validateType;
