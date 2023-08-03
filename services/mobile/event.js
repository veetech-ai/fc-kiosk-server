const URL = require("url").URL;

const { validateObjectV2, sanitizeHtml } = require("../../common/helper");
const ServiceError = require("../../utils/serviceError");
const models = require("../../models/index");

const EventModel = models.Event;
const _RESTRICTED_KEYS = ["id", "createdAt", "updatedAt"];

const ALLOWED_FIELDS = Object.keys(EventModel.rawAttributes).filter(
  (key) => !_RESTRICTED_KEYS.includes(key),
);

const validateEventBody = (body) => {
  if (!body) throw new ServiceError("Inalid payload", 400);

  validateObjectV2(body, {
    allowedKeys: ALLOWED_FIELDS,
    allowedKeysOnly: true,
  });

  const { corousal } = body;
  // strings also have `length` property, so adding array check as well
  if (!corousal || !corousal.length || !Array.isArray(corousal)) {
    throw new ServiceError("Invalid corousal payload", 400);
  }

  body.details = sanitizeHtml(body.details);

  return body;
};

exports.getEvents = (where) => {
  return EventModel.findAll({
    where,
    attributes: [
      "title",
      "imageUrl",
      "openingTime",
      "closingTime",
      "description",
    ],
  });
};

exports.getSingleEvent = async (where) => {
  const event = await EventModel.findOne({ where });

  if (!event) throw new ServiceError("Not Found", 404);

  return event;
};

exports.delelteEvent = async (id) => {
  await this.getSingleEvent({ id });
  return EventModel.destroy({ where: { id } });
};

exports.createEvent = async (body) => {
  return EventModel.create(validateEventBody(body));
};

exports.updateEvent = async (body, id) => {
  await this.getSingleEvent({ id });

  return EventModel.update(validateEventBody(body), { where: { id } });
};
