const mongoose = require("mongoose");
const Joi = require("joi");
const moment = require("moment");

const rentalSchema = new mongoose.Schema({
  user: {
    type: new mongoose.Schema({
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
        trim: true,
        minlength: 5,
        maxlength: 255
      }
    }),
    required: true
  },
  car: {
    type: new mongoose.Schema({
      name: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 50
      },
      dailyRentalRate: {
        type: Number,
        required: true,
        min: 0,
        max: 255
      }
    }),
    required: true
  },
  dateOut: {
    type: Date,
    required: true,
    default: Date.now
  },
  dateReturned: {
    type: Date
  },
  rentalFee: {
    type: Number,
    min: 0
  }
});

rentalSchema.statics.lookup = function(userId, carId) {
  return this.findOne({
    "user._id": userId,
    "car._id": carId,
    dateReturned: undefined
  });
};

rentalSchema.methods.return = function() {
  this.dateReturned = new Date();

  const rentalDays = moment().diff(this.dateOut, "days");
  this.rentalFee = rentalDays * this.car.dailyRentalRate;
};

const Rental = mongoose.model("Rental", rentalSchema);

function validateRental(rental) {
  const schema = {
    carId: Joi.objectId().required()
  };

  return Joi.validate(rental, schema);
}

exports.Rental = Rental;
exports.validate = validateRental;
