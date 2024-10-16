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
  function (value) {
    return validateIntegerRange(value, 0, 1000, 1, 4);
  },
  "Par value must be an integer and have a minimum value of 1 and a maximum of 1000, and contain 1 to 4 digits",
);

Validator.register(
  "yards",
  function (value) {
    return validateIntegerRange(value, 0, 10000, 1, 5);
  },
  "Yards value must be an integer and have a minimum value of 1 and a maximum of 10000, and contain 1 to 5 digits",
);

Validator.register(
  "slope",
  function (value) {
    return validateIntegerRange(value, 0, 500, 1, 3);
  },
  "Slope value must be an integer and have a minimum value of 1 and a maximum of 500, and contain 1 to 3 digits",
);

Validator.register(
  "year_built",
  function (value) {
    const currentYear = new Date().getFullYear();
    return validateIntegerRange(value, 1000, currentYear, 4, 4);
  },
  "year_built value must between 1000 to currentYear",
);

Validator.register(
  "gender",
  function (value) {
    return value === "male" || value === "female";
  },
  'The :attribute field must be either "male" or "female".',
);

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
