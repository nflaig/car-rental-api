const config = require("config");

module.exports = function() {
  if (!config.get("JWT_PRIVATE_KEY")) {
    throw new Error("ERROR: JWT_PRIVATE_KEY is not defined.");
  } else if (!config.get("DB_CONN")) {
    throw new Error("ERROR: DB_CONN is not defined.");
  }
};
