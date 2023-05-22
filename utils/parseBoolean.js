const ServiceError = require("./serviceError");
exports.parseBoolean = (value) => {
  const isStringBoolean =
    String(value).toLowerCase() === "true" ||
    String(value).toLowerCase() === "false" ||
    typeof value === "boolean";

  if (!isStringBoolean)
    throw new ServiceError(`isAddressed must be a boolean`, 400);

  return JSON.parse(String(value).toLowerCase());
};
