const models = require("../models");
const User_Device_Scheduling = models.User_Device_Scheduling;

exports.get_device_schedule = async (device_id) => {
  return await User_Device_Scheduling.findOne({
    where: { device_id: device_id },
  });
};

exports.save_schedule = async (schedule, user_id, device_id) => {
  const result = await User_Device_Scheduling.findOne({
    where: { device_id: device_id },
  });

  if (result) {
    const result = await User_Device_Scheduling.update(
      { user_id: user_id, schedule: schedule },
      { where: { device_id: device_id } },
    );

    if (!result) throw new Error("There is a problem. Please try later.");
    return result;
  } else {
    const result = await User_Device_Scheduling.create({
      schedule: schedule,
      user_id: user_id,
      device_id: device_id,
    });

    if (!result) throw new Error("There is a problem. Please try later.");
    return result;
  }
};
