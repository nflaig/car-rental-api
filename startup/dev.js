module.exports = function(app) {
  if (app.get("env") === "development") {
    app.use(require("morgan")("tiny"));
  }
};
