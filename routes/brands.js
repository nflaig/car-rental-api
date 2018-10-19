const { Brand, validate } = require("../models/brand");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");
const validateReqBody = require("../middleware/validateReqBody");
const express = require("express");
const router = express.Router();

const notFoundError = "Brand with given ID does not exist.";

router.get("/", async (req, res) => {
  const brands = await Brand.find().sort("name");
  res.send(brands);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const brand = await Brand.findById(req.params.id);

  if (!brand) return res.status(404).send(notFoundError);

  res.send(brand);
});

router.post("/", [auth, admin, validateReqBody(validate)], async (req, res) => {
  const brand = new Brand({ name: req.body.name });
  await brand.save();

  res.status(201).send(brand);
});

router.put(
  "/:id",
  [auth, admin, validateObjectId, validateReqBody(validate)],
  async (req, res) => {
    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );

    if (!brand) return res.status(404).send(notFoundError);

    res.send(brand);
  }
);

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const brand = await Brand.findByIdAndRemove(req.params.id);

  if (!brand) return res.status(404).send(notFoundError);

  res.send(brand);
});

module.exports = router;
