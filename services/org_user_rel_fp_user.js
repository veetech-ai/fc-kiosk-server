const models = require("../models");
const orgUserRelFpUser = models.org_user_rel_fp_user;

module.exports.relateUserIdWithDeviceUserId = async (
  user_id,
  device_id,
  orgId,
  device_user_id,
) => {
  try {
    const addNewFingerPrint = await orgUserRelFpUser.create({
      user_id: user_id,
      device_id: device_id,
      orgId: orgId,
      device_user_id: device_user_id,
    });

    return addNewFingerPrint;
  } catch (err) {
    throw new Error(err);
  }
};

module.exports.deleteRelationUserIdWithDeviceUserId = async (
  user_id,
  device_id,
  device_user_id,
) => {
  try {
    const deleteUserFingerPrint = await orgUserRelFpUser.destroy({
      where: {
        user_id: user_id,
        device_id: device_id,
        device_user_id: device_user_id,
      },
    });
    return deleteUserFingerPrint;
  } catch (err) {
    throw new Error(err);
  }
};

module.exports.findUserByDeviceNDeviceUserId = async (
  user_id,
  device_id,
  device_user_id,
) => {
  try {
    const checkFingerPrint = await orgUserRelFpUser.findOne({
      where: {
        user_id: user_id,
        device_id: device_id,
        device_user_id: device_user_id,
      },
    });
    return checkFingerPrint;
  } catch (err) {
    throw new Error(err);
  }
};

module.exports.list = async (where) => {
  try {
    const getAllUser = await orgUserRelFpUser.findAll({
      where: where,
      include: [
        {
          as: "Users",
          model: models.User,
          required: true,
          attributes: ["id", "name", "email"],
        },
      ],
    });
    return getAllUser;
  } catch (err) {
    throw new Error(err);
  }
};
module.exports.findUserByDeviceIdNDeviceUserId = async (where) => {
  const checkUser = await orgUserRelFpUser.findOne({
    where: where,
  });
  return checkUser;
};
