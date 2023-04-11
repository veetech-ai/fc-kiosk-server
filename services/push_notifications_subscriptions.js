const models = require("../models");
const PushNotificationsSubscriptions = models.Push_Notifications_Subscriptions;

exports.get = async (user_id = null) => {
  const where = user_id ? { user_id: user_id, status: 1 } : { status: 1 };
  return await PushNotificationsSubscriptions.findAll({
    where: where,
  });
};

exports.save = async (params) => {
  return await PushNotificationsSubscriptions.create(params);
};

exports.update = async (params, where) => {
  const result = await PushNotificationsSubscriptions.update(params, {
    where: where,
  });

  if (!result) throw new Error("There is a problem. Please try later.");
  return result;
};
