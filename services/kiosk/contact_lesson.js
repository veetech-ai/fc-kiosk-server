const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");

const ContactCoach = models.Contact_Coach;

async function createContactCoach(reqBody) {
  const contactCoach = await ContactCoach.create(reqBody);
  return contactCoach;
}

async function getContactCoachesByLessonId(lessonId) {
  const contactCoaches = await ContactCoach.findAll({
    where: { coach_id: lessonId },
  });

  return contactCoaches;
}

async function updateContactCoachIsAddressable(contactCoachId, body) {
  const [affectedRows] = await ContactCoach.update(
    { ...body },
    { where: { id: contactCoachId } },
  );

  return affectedRows;
}

async function getContactCoachbyId(where, loggedInUserOrgId) {
  let clonedWhere = { ...where };
  if (loggedInUserOrgId) clonedWhere.orgId = loggedInUserOrgId;
  const contactCoach = await ContactCoach.findOne({
    where:clonedWhere,
  });
  if (!contactCoach) {
    throw new ServiceError("Not found", 404);
  }
  return contactCoach;
}

module.exports = {
  createContactCoach,
  getContactCoachesByLessonId,
  getContactCoachbyId,
  updateContactCoachIsAddressable,
};
