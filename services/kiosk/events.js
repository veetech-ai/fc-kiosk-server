const { validateObjectV2, sanitizeHtmlInput } = require("../../common/helper");
const ServiceError = require("../../utils/serviceError");
const models = require("../../models/index");

const EventModel = models.Event;
const _RESTRICTED_KEYS = ["id", "createdAt", "updatedAt"];

const ALLOWED_FIELDS = Object.keys(EventModel.rawAttributes).filter(
  (key) => !_RESTRICTED_KEYS.includes(key),
);

exports.getEvents = async ({ where = {}, paginationOptions = {} }) => {
  const events = await EventModel.findAll({
    ...paginationOptions,
    where,
  });

  const count = await EventModel.count();

  return { events, count };
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
    body.details = sanitizeHtmlInput(body.details);
  }

  return EventModel.create(body);
};

exports.updateEvent = async (body, id) => {
  const event = await this.getSingleEvent({ id }); // to throw error, if not found

  if (!body) throw new ServiceError("Invalid payload", 400);

  body = validateObjectV2(body, { allowedKeys: ALLOWED_FIELDS });

  if (body.details) {
    body.details = sanitizeHtmlInput(body.details);
  }

  await EventModel.update(body, { where: { id } });

  return { ...event.dataValues, ...body };
};
