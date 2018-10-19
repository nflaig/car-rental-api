const mongoose = require("mongoose");
const Joi = require("joi");
const { Brand } = require("./brand");
const { Type } = require("./type");

const Car = mongoose.model(
  "Car",
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 50
    },
    brand: {
      type: Brand.schema,
      required: true
    },
    type: {
      type: Type.schema,
      required: true
    },
    numberOfSeats: {
      type: Number,
      min: 1,
      max: 255,
      default: 5
    },
    numberOfDoors: {
      type: Number,
      min: 1,
      max: 255,
      default: 4
    },
    transmission: {
      type: String,
      enum: ["Manual", "Automatic"],
      default: "Manual"
    },
    airConditioner: {
      type: Boolean,
      default: false
    },
    numberInStock: {
      type: Number,
      required: true,
      min: 0,
      max: 255
    },
    dailyRentalRate: {
      type: Number,
      required: true,
      min: 0,
      max: 255
    }
  })
);

function validateCar(car) {
  const schema = {
    name: Joi.string()
      .min(1)
      .max(50)
      .required(),
    brandId: Joi.objectId().required(),
    typeId: Joi.objectId().required(),
    numberOfSeats: Joi.number()
      .integer()
      .min(1),
    numberOfDoors: Joi.number()
      .integer()
      .min(1),
    transmission: Joi.string().only("Manual", "Automatic"),
    airConditioner: Joi.boolean(),
    numberInStock: Joi.number()
      .integer()
      .min(0)
      .required(),
    dailyRentalRate: Joi.number()
      .min(0)
      .required()
  };

  return Joi.validate(car, schema);
}

exports.Car = Car;
exports.validate = validateCar;
