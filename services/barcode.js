const models = require("../models");
const Barcode = models.Barcode;

exports.findOne = async (data) => {
  const result = await Barcode.findOne({ where: data });
  if (result) return result;
  throw new Error("Barcode not found");
};
