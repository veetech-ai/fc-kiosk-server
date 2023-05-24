const config = require("../../config/config");
const helper = require("../../common/helper");
const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const Course = models.Course;
const ScreenConfig = models.Screen_Config;
const Organization = models.Organization;

async function createScreenConfig(gcId, orgId) {
  const screens = await ScreenConfig.create({
    gcId,
    orgId,
  });

  return screens;
}

async function getScreensByCourses(gcId) {
  // Check if golf course exist
  const course = await Course.findOne({ where: { id: gcId } });
  if (!course) {
    throw new ServiceError(`course not found`, 200);
  }
  // Find screen record
  const screens = await ScreenConfig.findOne({
    where: {
      gcId,
    },
    attributes: {
      exclude: ["gc_id", "org_id"],
    },
  });
  return screens;
}
async function updateScreens(gcId, reqBody) {
  // Check if golf course exist
  if (!mqtt_connection_ok) {
    helper.set_mqtt_connection_lost_log("screens.js.updateScreens");
    throw new ServiceError("Connection with broker is down");
  }
  const course = await Course.findOne({ where: { id: gcId } });
  if (!course) {
    throw new ServiceError(`course not found`, 200);
  }
  // Find screen record
  const screens = await ScreenConfig.findOne({
    where: {
      gcId,
    },
    attributes: {
      exclude: ["gc_id", "org_id"],
    },
  });

  if (!screens) {
    throw new ServiceError(`ScreenConfig not found for the given gcId`, 200);
  }

  // Update the fields with the data provided in the request body
  Object.assign(screens, reqBody);
  await screens.save();

  helper.mqtt_publish_message(
    `gc/${gcId}/screens`,
    helper.mqttPayloads.updateScreens,
    false,
  );

  return screens;
}
module.exports = {
  createScreenConfig,
  getScreensByCourses,
  updateScreens,
};
