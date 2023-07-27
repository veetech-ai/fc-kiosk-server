exports.isValidNumber = (input) => {
  if (Number.isInteger(input)) return true;

  if (
    typeof input === "string" &&
    input.toUpperCase() === input.toLowerCase()
  ) {
    return true;
  }

  return false;
};
