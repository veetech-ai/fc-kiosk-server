const { validateObjectV2, sanitizeHtml } = require("../../common/helper");
const ServiceError = require("../../utils/serviceError");
const models = require("../../models/index");

const EventModel = models.Event;
const _RESTRICTED_KEYS = ["id", "createdAt", "updatedAt"];

const ALLOWED_FIELDS = Object.keys(EventModel.rawAttributes).filter(
  (key) => !_RESTRICTED_KEYS.includes(key),
);

exports.getEvents = (where) => {
  return EventModel.findAll({
    where,
    attributes: [
      "id",
      "title",
      "gcId",
      "imageUrl",
      "openingTime",
      "closingTime",
      "description",
    ],
  });
};

exports.getSingleEvent = async (where) => {
  const event = await EventModel.findOne({ where });

  if (!event) throw new ServiceError(`Event Not Found`, 404);

  return event;
};

exports.delelteEvent = async (id) => {
  await this.getSingleEvent({ id });
  return EventModel.destroy({ where: { id } });
};

exports.createEvent = async (body) => {
  if (!body) throw new ServiceError("Invalid payload", 400);

  validateObjectV2(body, {
    allowedKeys: ALLOWED_FIELDS,
    allowedKeysOnly: true,
  });

  if (body.corousal) {
    if (!Array.isArray(body.corousal)) {
      throw new ServiceError("Invalid corousal payload", 400);
    }

    if (body.corousal.some((item) => typeof item !== "string")) {
      throw new ServiceError("'corousal' array can contain strings only");
    }
  }

  if (body.details) {
    body.details = sanitizeHtml(body.details);
  }

  return EventModel.create(body);
};

exports.updateEvent = async (body, id) => {
  const event = await this.getSingleEvent({ id });

  if (!body) throw new ServiceError("Invalid payload", 400);

  body = validateObjectV2(body, { allowedKeys: ALLOWED_FIELDS });

  if (body.details) {
    body.details = sanitizeHtml(body.details);
  }

  await EventModel.update(body, { where: { id } });

  return { ...event.dataValues, ...body };
};
