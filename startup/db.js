const mongoose = require("mongoose");
const Fawn = require("fawn");
const winston = require("winston");
const config = require("config");

module.exports = function() {
  const db = config.get("DB_CONN");
  mongoose
    .connect(
      db,
      { useNewUrlParser: true }
    )
    .then(() => winston.info(`Connected to ${db}...`));

  Fawn.init(mongoose);
};
