const _ = require("lodash");
const ServiceError = require("../../utils/serviceError");
const models = require("../../models/index");

const EventModel = models.Event;
const _RESTRICTED_KEYS = ["id", "createdAt", "updatedAt"];

const ALLOWED_FIELDS = Object.keys(EventModel.rawAttributes).filter(
  (key) => !_RESTRICTED_KEYS.includes(key),
);

const validateObjectV2 = (inputObject, validations = {}) => {
  const {
    allowedKeys = [],
    allowedKeysOnly = false,
    exactMatch = false,
  } = validations;

  const objectClone = { ...inputObject };
  const inputKeys = Object.keys(objectClone);

  const inValidFields = inputKeys.filter((f) => !allowedKeys.includes(f));

  if (
    exactMatch &&
    inValidFields.length &&
    inputKeys.length != allowedKeys.length
  ) {
    throw new ServiceError(
      `Payload should exactly contain: ${allowedKeys.join(", ")}`,
      400,
    );
  }

  if (allowedKeysOnly && inValidFields.length) {
    throw new ServiceError("Invalid keys in the payload", 400);
  }

  if (inValidFields.length == inputKeys.length) {
    throw new ServiceError("Payload is invalid", 400);
  }

  return _.pick(objectClone, allowedKeys);
};

const sanitizeHtml = (dirtyHTML, options = {}) => {
  return sanitizeHtml(dirtyHTML, {
    allowedTags: sanitizeHtml.defaults.allowedTags,
    disallowedTagsMode: "discard",
    allowedAttributes: sanitizeHtml.defaults.allowedAttributes,
    allowedIframeHostnames: [],
    ...options,
  });
};

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
    body.details = sanitizeHtml(body.details);
  }

  return EventModel.create(body);
};

exports.updateEvent = async (body, id) => {
  const event = await this.getSingleEvent({ id }); // to throw error, if not found

  if (!body) throw new ServiceError("Invalid payload", 400);

  body = validateObjectV2(body, { allowedKeys: ALLOWED_FIELDS });

  if (body.details) {
    body.details = sanitizeHtml(body.details);
  }

  await EventModel.update(body, { where: { id } });

  return { ...event.dataValues, ...body };
};
