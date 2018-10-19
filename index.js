const winston = require("winston");
const express = require("express");
const app = express();

require("./startup/config")();
require("./startup/logging")();
require("./startup/dev")(app);
require("./startup/prod")(app);
require("./startup/routes")(app);
require("./startup/db")();
require("./startup/validation")();

const port = process.env.PORT || 3000;
const server = app.listen(port, () =>
  winston.info(`Listen on port ${port}...`)
);

module.exports = server;
