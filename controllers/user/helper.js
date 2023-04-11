// Common Imports
const helper = require("../../common/helper");
const email = require("../../common/email");
const apiResponse = require("../../common/api.response");

// Logger Imports
const { logger } = require("../../logger");

// Model Imports
const UserModel = require("../../services/user");
const UsersStatus = UserModel.UsersStatus;

// Configuration Imports
const config = require("../../config/config");

// update the user if any user have the same card serial
// remove the card serial of existing user
exports.isOverWrite = async (cardSerial, organizationId) => {
  const user = await UserModel.findByCardSerial(cardSerial, organizationId);
  if (user) {
    if (user.status != UsersStatus.dummy) {
      logger.info("update user card");
      await UserModel.update_user(user.id, {
        cardSerial: null,
      });
    }
  }
};

exports.send_password_reset_email = async (req, res, user) => {
  try {
    const token = helper.generate_verify_token();
    await UserModel.set_password_token(user.id, token);

    // email user
    await email.forget_password(user, token);

    return apiResponse.success(res, req, "Password Reset request sent", 200);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_user_auth_tokens = (req, user) => {
  const user_obj = JSON.parse(JSON.stringify(user));
  const expire_time =
    req.body.remember && req.body.remember == "true"
      ? config.jwt.expirationShortInSeconds
      : config.jwt.expirationShortInSeconds;

  user_obj.expire_time = parseInt(expire_time);
  user_obj.admin = !!helper.hasProvidedRoleRights(user.Role, ["admin"]).success;
  user_obj.super_admin = !!helper.hasProvidedRoleRights(user.Role, ["super"])
    .success;

  const accessToken = helper.createJwtToken({
    user: user_obj,
    expire_time: user_obj.expire_time,
  });

  const refreshToken = helper.createJwtToken({
    user: user_obj,
    expire_time: config.jwt.refreshExpirationInSeconds,
  });

  return {
    accessToken,
    refreshToken,
  };
};
