const models = require("../models");
const Timezones = models.Timezones;

exports.list = async () => {
  return await Timezones.findAll({
    attributes: [
      "area",
      "time_zone_value",
      "minutes_diff",
      "hours_diff",
      "tz",
      "status",
    ],
    where: { status: 1 },
  });
};
