const URL = require("url").URL;
const { validateObjectV2 } = require("../../common/helper");
const ServiceError = require("../../utils/serviceError");
const models = require("../../models/index");

const EventModel = models.Event;
const _FILTERED_KEYS = ["id", "createdAt", "updatedAt"];

const ALLOWED_FIELDS = Object.keys(EventModel.rawAttributes)
  .map(([key]) => key)
  .filter((key) => !_FILTERED_KEYS.includes(key));

exports.getEvents = (where, attributes) => {
  if (attributes) {
    validateObjectV2(attributes, {
      allowedKeys: ALLOWED_FIELDS,
      allowedKeysOnly: true,
    });
  }
  return EventModel.findAll({ where, attributes });
};

exports.getSingleEvent = async (where, attributes) => {
  if (attributes) {
    validateObjectV2(attributes, {
      allowedKeys: ALLOWED_FIELDS,
      allowedKeysOnly: true,
    });
  }

  const event = await EventModel.findOne({ where, attributes });

  if (!event) throw new ServiceError("Not Found", 404);

  return event;
};

exports.delelteEvent = async (id) => {
  await this.getSingleEvent({ id });
  return EventModel.destroy({ where: { id } });
};

exports.updateEvent = async (values, id) => {
  await this.getSingleEvent({ id });

  if (!values) throw new ServiceError("Inalid payload", 400);

  validateObjectV2(values, {
    allowedKeys: ALLOWED_FIELDS,
    allowedKeysOnly: true,
  });

  try {
    const corousal = JSON.parse(values.corousal);

    // strings also have `length` property, so adding array check as well
    if (!corousal || !corousal.length || !Array.isArray(corousal)) {
      throw new Error();
    }

    // verify each url in corousal array is a valid URL
    corousal.forEach((url) => new URL(url));
  } catch (err) {
    throw new ServiceError("Invalid corousal payload", 400);
  }

  return EventModel.update(values, { where: { id } });
};
