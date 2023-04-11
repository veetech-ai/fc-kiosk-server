const orgUserRelFpUser = require("./org_user_rel_fp_user");
const UserModel = require("./user");

exports.deAttachUserFromFingerprint = async function (
  userId,
  deviceId,
  deviceUserId,
) {
  try {
    const result = await orgUserRelFpUser.deleteRelationUserIdWithDeviceUserId(
      userId,
      deviceId,
      deviceUserId,
    );
    return result;
  } catch (e) {
    // Log Errors
    throw Error("Error while Paginating Users");
  }
};

exports.attachUserWithFingerprint = async function (
  userId,
  deviceId,
  deviceUserId,
) {
  try {
    const user = await UserModel.findById(userId);
    const result = await orgUserRelFpUser.relateUserIdWithDeviceUserId(
      userId,
      deviceId,
      user.orgId,
      deviceUserId,
    );
    return result;
  } catch (e) {
    // Log Errors
    throw Error("Error while Paginating Users");
  }
};

exports.getUserOfFingerprint = async function (orgId, { userId, deviceId }) {
  try {
    const where = {};
    if (orgId) {
      where.orgId = orgId;
    }
    if (deviceId) {
      where.device_id = deviceId;
    }
    if (userId) {
      where.user_id = userId;
    }
    const result = await orgUserRelFpUser.list(where);
    return result;
  } catch (e) {
    // Log Errors
    throw Error("Error while Paginating Users");
  }
};
exports.getUserIdByDeviceId = async function (deviceUserId, deviceId) {
  try {
    const where = {};
    if (deviceUserId) {
      where.device_user_id = deviceUserId;
    }
    if (deviceId) {
      where.device_id = deviceId;
    }
    const result = await orgUserRelFpUser.findUserByDeviceIdNDeviceUserId(
      where,
    );
    return result;
  } catch (error) {
    throw Error(error);
  }
};
