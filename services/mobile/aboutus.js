const { AboutUs } = require("../../models");
const helpers = require("../../common/helper");

exports.getAboutUs = async () => {
  const about = await AboutUs.findOne();
  return about;
};

exports.updateAboutUs = async (id, data) => {
  const [affectedRows] = await AboutUs.update(data, {
    where: { id },
  });
  if (affectedRows) {
    helpers.mqtt_publish_message(`aboutus`, {
      action: "aboutus",
    });
  }

  return affectedRows;
};
