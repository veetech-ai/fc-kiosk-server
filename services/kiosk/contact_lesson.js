const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");

const ContactCoach = models.Contact_Coach;

async function createContactCoach(reqBody) {
  const contactCoach = await ContactCoach.create(reqBody);
  if (!contactCoach) {
    return new ServiceError("Something went wrong", 401);
  }
  return contactCoach;
}

async function getContactCoachesByLessonId(lessonId) {
  const contactCoaches = await ContactCoach.findAll({
    where: { coach_id: lessonId },
  });
  if (!contactCoaches.length) {
    return new ServiceError("Something went wrong", 401);
  }
  return contactCoaches;
}

async function updateContactCoachIsAddressable(contactCoachId, reqBody) {
  const [affectedRows] = await ContactCoach.update(
    { isAddressed: true },
    { where: { id: contactCoachId } },
  );
  if (affectedRows === 0) {
    throw new ServiceError("Something went wrong", 401);
  }
  return affectedRows;
}

async function getContactCoachbyId(contactCoachId) {
  const contactCoach = await ContactCoach.findOne({
    where: { id: contactCoachId },
  });
  if (!contactCoach) {
    return new ServiceError("Something went wrong", 401);
  }
  return contactCoach;
}

module.exports = {
  createContactCoach,
  getContactCoachesByLessonId,
  getContactCoachbyId,
  updateContactCoachIsAddressable,
};
