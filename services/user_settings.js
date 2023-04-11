const models = require("../models");
const UserSettings = models.User_Settings;

exports.get = async (user_id) => {
  return await UserSettings.findOne({ where: { user_id: user_id } });
};

exports.save = async (params) => {
  const result = await UserSettings.findOne({
    where: { user_id: params.user_id },
  });

  if (result)
    return await UserSettings.update(params, {
      where: { user_id: result.user_id },
    });
  else return await UserSettings.create(params);
};
