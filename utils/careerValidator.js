const Validator = require("validatorjs");

Validator.register(
  "json",
  function (value) {
    try {
      JSON.parse(value);
    } catch (e) {
      return false;
    }
    return true;
  },
  "The :attribute must be a JSON string.",
);
