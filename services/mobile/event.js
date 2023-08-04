const sanitizeHtml = require("sanitize-html");
const _ = require("lodash");

const ServiceError = require("../../utils/serviceError");
const models = require("../../models/index");

const EventModel = models.Event;
const _RESTRICTED_KEYS = ["id", "createdAt", "updatedAt"];

const ALLOWED_FIELDS = Object.keys(EventModel.rawAttributes).filter(
  (key) => !_RESTRICTED_KEYS.includes(key),
);

/**
 * Validates an object based on provided validations and returns a filtered object.
 * @param {object} inputObject - The raw object to be validated.
 * @param {object} [validations={}] - Validation options for the given object.
 * @param {string[]} [validations.allowedKeys] - An array of keys to retain in the filtered object.
 * @param {boolean} [validations.allowedKeysOnly=false] - Set to true to ensure that all the keys in `inputObject` are a subset of `allowedKeys`.
 * @param {boolean} [validations.exactMatch=false] - Set to true to enforce an exact match of keys in `inputObject` with `allowedKeys`. Setting this to `true` will overwrite `allowedKeysOnly` option.
 * @returns {object} The filtered object containing only the allowed keys.
 */

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

exports.sanitizeHtml = (dirtyHTML, options = {}) => {
  return sanitizeHtml(dirtyHTML, {
    allowedTags: sanitizeHtml.defaults.allowedTags,
    disallowedTagsMode: "discard",
    allowedAttributes: sanitizeHtml.defaults.allowedAttributes,
    allowedIframeHostnames: [],
    ...options,
  });
};

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
