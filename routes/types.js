const { Type, validate } = require("../models/type");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");
const validateReqBody = require("../middleware/validateReqBody");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const types = await Type.find().sort("name");
  res.send(types);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const type = await Type.findById(req.params.id);

  if (!type) return res.status(404).send("Type with given ID does not exist.");

  res.send(type);
});

router.post("/", [auth, admin, validateReqBody(validate)], async (req, res) => {
  const type = new Type({ name: req.body.name });
  await type.save();

  res.status(201).send(type);
});

router.put(
  "/:id",
  [auth, admin, validateObjectId, validateReqBody(validate)],
  async (req, res) => {
    const type = await Type.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );

    if (!type)
      return res.status(404).send("Type with given ID does not exist.");

    res.send(type);
  }
);

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const type = await Type.findByIdAndRemove(req.params.id);

  if (!type) return res.status(404).send("Type with given ID does not exist.");

  res.send(type);
});

module.exports = router;
