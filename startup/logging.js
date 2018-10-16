require("express-async-errors");
require("winston-mongodb");
const winston = require("winston");
const config = require("config");

module.exports = function() {
  winston.handleExceptions(
    new winston.transports.Console({ colorize: true, prettyPrint: true }),
    new winston.transports.File({ filename: "combined.log" })
  );

  process.on("unhandledRejection", ex => {
    throw ex;
  });

  winston.add(winston.transports.File, { filename: "combined.log" });
  winston.add(winston.transports.MongoDB, {
    db: config.get("DB_CONN"),
    level: "error"
  });
};
