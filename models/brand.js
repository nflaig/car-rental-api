const mongoose = require("mongoose");
const Joi = require("joi");

const Brand = mongoose.model(
  "Brand",
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

function validateBrand(brand) {
  const schema = {
    name: Joi.string()
      .min(1)
      .max(50)
      .required()
  };

  return Joi.validate(brand, schema);
}

exports.Brand = Brand;
exports.validate = validateBrand;
