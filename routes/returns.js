const { Rental, validate } = require("../models/rental");
const auth = require("../middleware/auth");
const validateReqBody = require("../middleware/validateReqBody");
const Fawn = require("fawn");
const express = require("express");
const router = express.Router();

router.post("/", [auth, validateReqBody(validate)], async (req, res) => {
  const rental = await Rental.lookup(req.user._id, req.body.carId);

  if (!rental)
    return res
      .status(400)
      .send("Rental does not exist or return already processed.");

  rental.return();

  await new Fawn.Task()
    .update(
      "rentals",
      { _id: rental._id },
      { dateReturned: rental.dateReturned, rentalFee: rental.rentalFee }
    )
    .update(
      "cars",
      { _id: rental.car._id },
      {
        $inc: { numberInStock: 1 }
      }
    )
    .run();

  res.send(rental);
});

module.exports = router;
