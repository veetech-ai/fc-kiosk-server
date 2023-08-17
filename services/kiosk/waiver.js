const models = require("../../models");
const ServiceError = require("../../utils/serviceError");

const { Signed_Waiver, Waiver } = models;

exports.sign = async (gcId, email, signatureUrl) => {
  const waiver = await Waiver.findOne({ where: { gcId } });

  if (!waiver) {
    throw new ServiceError(`No waiver found against gcId ${gcId}`, 404);
  }

  return Signed_Waiver.create({
    gcId,
    email,
    signature: signatureUrl,
    waiverId: waiver.id,
  });
};

exports.generateSignedPDF = () => {};

exports.updateContent = async (id, content) => {
  const waiver = await Waiver.findOne({ where: { id } });

  if (!waiver) throw new ServiceError(`Not Found`, 404);

  // TODO sanitize HTML content

  const [rowsUpdated] = Waiver.update({ content }, { where: { id } });

  if (!rowsUpdated) return "No change in db";

  return id;
};

exports.deleteSigned = async (id) => {
  const signed = await Signed_Waiver.findOne({ where: { id } });

  if (!signed) {
    throw new ServiceError(`Not Found`, 404);
  }

  return Signed_Waiver.destroy({ where: { id } });
};

exports.getSigned = (gcId) => {
  return Signed_Waiver.findAll({
    where: { gcId },
    attributes: [["id", "signedId"], "email", "signature"],
    include: {
      model: Waiver,
      attributes: ["id", "name", "gcId"],
    },
  });
};

exports.getContent = (id) => {
  return Waiver.destroy({
    where: { id },
    attributes: ["id", "name", "content", "gcId"],
  });
};
