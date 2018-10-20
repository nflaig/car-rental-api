const { Rental, validate } = require("../models/rental");
const { Car } = require("../models/car");
const { User } = require("../models/user");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");
const validateReqBody = require("../middleware/validateReqBody");
const Fawn = require("fawn");
const express = require("express");
const router = express.Router();

const notFoundError = "Rental with given ID does not exist.";
const userIdError = "Invalid user.";
const carIdError = "Invalid car.";
const inRentalError = "Car is already in rental.";
const notInStockError = "Car not in stock.";

router.get("/", [auth, admin], async (req, res) => {
  const rentals = await Rental.find().sort("-dateOut");
  res.send(rentals);
});

router.get("/me", auth, async (req, res) => {
  const rentals = await Rental.find({ "user._id": req.user._id }).sort(
    "-dateOut"
  );
  res.send(rentals);
});

router.get("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const rental = await Rental.findById(req.params.id);

  if (!rental) return res.status(404).send(notFoundError);

  res.send(rental);
});

router.post("/", [auth, validateReqBody(validate)], async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(400).send(userIdError);

  const car = await Car.findById(req.body.carId);
  if (!car) return res.status(400).send(carIdError);

  let rental = await Rental.lookup(req.user._id, req.body.carId);
  if (rental && !rental.dateReturned)
    return res.status(400).send(inRentalError);

  if (car.numberInStock === 0) return res.status(400).send(notInStockError);

  rental = new Rental({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email
    },
    car: {
      _id: car._id,
      name: car.name,
      dailyRentalRate: car.dailyRentalRate
    }
  });

  await new Fawn.Task()
    .save("rentals", rental)
    .update(
      "cars",
      { _id: car._id },
      {
        $inc: { numberInStock: -1 }
      }
    )
    .run();

  res.status(201).send(rental);
});

module.exports = router;
