const ServiceError = require("./serviceError");

exports.parseBoolean = (value, fieldKey = "field") => {
  const isStringBoolean =
    String(value).toLowerCase() === "true" ||
    String(value).toLowerCase() === "false" ||
    typeof value === "boolean";

  if (!isStringBoolean)
    throw new ServiceError(`${fieldKey} must be a boolean`, 400);

  return JSON.parse(String(value).toLowerCase());
};
