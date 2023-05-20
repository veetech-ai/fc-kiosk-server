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

async function updateContactCoachIsAddressable(
  contactCoachId,
  isAddressedBoolean,
) {
  const [affectedRows] = await ContactCoach.update(
    { isAddressed: isAddressedBoolean },
    { where: { id: contactCoachId } },
  );

  return affectedRows;
}

async function getContactCoachbyId(contactCoachId) {
  const contactCoach = await ContactCoach.findOne({
    where: { id: contactCoachId },
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
