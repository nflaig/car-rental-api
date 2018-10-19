const { User } = require("../models/user");
const validateReqBody = require("../middleware/validateReqBody");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const express = require("express");
const router = express.Router();

const invalidError = "Invalid email or password.";

router.post("/", validateReqBody(validate), async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send(invalidError);

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send(invalidError);

  const token = user.generateAuthToken();

  res.send(token);
});

function validate(data) {
  const schema = {
    email: Joi.string()
      .email()
      .required()
      .min(5)
      .max(255),
    password: Joi.string()
      .required()
      .min(8)
      .max(255)
  };

  return Joi.validate(data, schema);
}

module.exports = router;
