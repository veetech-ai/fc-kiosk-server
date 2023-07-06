const Validator = require("validatorjs");

// validationUtils.js
const validateIntegerRange = (
  value,
  minValue,
  maxValue,
  minDigits,
  maxDigits,
) => {
  if (isNaN(value) || !Number.isInteger(Number(value))) {
    return false;
  }

  const intValue = parseInt(value, 10);
  if (intValue < minValue || intValue > maxValue) {
    return false;
  }

  const numDigits = value.length;
  if (numDigits < minDigits || numDigits > maxDigits) {
    return false;
  }

  return true;
};

Validator.register(
  "par",
  function (value, requirement, attribute) {
    return validateIntegerRange(value, 0, 1000, 1, 4);
  },
  "Par value must be an integer and have a minimum value of 1 and a maximum of 1000, and contain 1 to 4 digits",
);

Validator.register(
  "yards",
  function (value, requirement, attribute) {
    return validateIntegerRange(value, 0, 10000, 1, 5);
  },
  "Yards value must be an integer and have a minimum value of 1 and a maximum of 10000, and contain 1 to 5 digits",
);

Validator.register(
  "slope",
  function (value, requirement, attribute) {
    return validateIntegerRange(value, 0, 500, 1, 3);
  },
  "Slope value must be an integer and have a minimum value of 1 and a maximum of 500, and contain 1 to 3 digits",
);

module.exports = {
  validateIntegerRange,
};
