const { Op } = require("sequelize");
const models = require("../../models");
const ServiceError = require("../../utils/serviceError");
const { sanitizeHtmlInput } = require("../../common/helper");

const { Signed_Waiver, Waiver } = models;

exports.getSignedWaiverHTML = async (course, signatoryEmail, signatureUrl) => {
  const waiver = await Waiver.findOne({
    where: { gcId: course.id },
    attributes: ["content"],
  });

  const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Rent A Cart</title>
  </head>
  <body>
    <main>
      ${waiver.content}
      <div
        style="
          display: flex;
          flex-direction: row;
          justify-content: space-between;
        "
      >
        <div>
          <h3>Course Owner</h3>
          <p>${course.name}</p>
          <p>${course.email}</p>
        </div>
        <div>
        <h3>Signatory</h3>
          <div style="height: 80px">
            <img style="height: 100%" src="${signatureUrl}" alt="signature" />
          </div>
          <p><u>${new Date().toDateString()}</u></p>
          <p>${signatoryEmail}</p>
        </div>
      </div>
    </main>
  </body>
</html>
  `;

  return html;
};

exports.sign = async (gcId, email, signatureUrl) => {
  const waiver = await Waiver.findOne({ where: { gcId } });

  if (!waiver) {
    throw new ServiceError(`No waiver found against gcId ${gcId}`, 404);
  }

  // Make sure this waiver is not signed already by this user
  // i.e a record against same email exists
  // and it was created before any updation in waiver
  const conflict = await Signed_Waiver.findOne({
    where: {
      [Op.and]: {
        email,
        createdAt: { [Op.gt]: waiver.updatedAt },
      },
    },
  });

  if (conflict) {
    // ! Commenting for testing
    // throw new ServiceError("You already have signed this waiver", 409);
  }

  return Signed_Waiver.create({
    email,
    signature: signatureUrl,
    waiverId: waiver.id,
  });
};

exports.updateContent = async (id, content) => {
  const waiver = await Waiver.findOne({ where: { id } });

  if (!waiver) throw new ServiceError(`Not Found`, 404);

  if (!content.trim().length) {
    throw new ServiceError("Content can not be emtpy", 400);
  }

  // sanitize HTML content
  content = sanitizeHtmlInput(content);

  // check if this content is different from existing
  const unchanged = await Waiver.findOne({ where: { content } });

  if (unchanged) {
    throw new ServiceError(
      "New content must be different from current waiver content",
      400,
    );
  }

  const [rowsUpdated] = await Waiver.update({ content }, { where: { id } });

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

exports.getSigned = async (gcId, pagination) => {
  const waiver = await Waiver.findOne({ where: { gcId } });

  const waivers = await Signed_Waiver.findAll({
    where: { waiverId: waiver.id },
    ...pagination,
    attributes: [["id", "signingId"], "email", "signature"],
    include: {
      model: Waiver,
      attributes: ["id", "name", "gcId"],
    },
  });

  const count = await Signed_Waiver.count({ where: { waiverId: waiver.id } });

  return { waivers, count };
};

exports.getContent = (id) => {
  return Waiver.destroy({
    where: { id },
    attributes: ["id", "name", "content", "gcId"],
  });
};
