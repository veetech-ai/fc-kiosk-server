// Common Imports
const helper = require("../../common/helper");
const apiResponse = require("../../common/api.response");
const email = require("../../common/email");

// Service Imports
const UserModel = require("../../services/user");
const UsersStatus = UserModel.UsersStatus;

// Configuration Imports
const settings = require("../../config/settings");

exports.login_action = async (
  req,
  res,
  user,
  check_password = true,
  from_social = null,
) => {
  // Verify Password
  if (check_password) {
    try {
      await helper.matchPassword(req.body.password, user.password);
    } catch (err) {
      if (err == "Invalid Password") return apiResponse.fail(res, err, 422);
      else return apiResponse.fail(res, err, 407);
    }
  }

  if (
    user.status == UsersStatus.inactive &&
    !(from_social && req.body.auto_verify)
  )
    return apiResponse.fail(res, "inactive", 403);
  else if (user.status == UsersStatus.deleted)
    return apiResponse.fail(res, "deleted", 403);

  try {
    if (from_social && req.body.auto_verify) {
      try {
        await UserModel.update_where(
          { status: 1, email_token: null, email_code: null },
          { id: user.id },
        );
      } catch (err) {
        // user automatic verification failed
        return apiResponse.fail(res, "inactive", 403);
      }
    }

    const tokens = helper.get_user_auth_tokens(req, user);

    if (from_social) {
      let update_user = {};
      if (from_social == "g" && !user.g_id) {
        update_user = { g_id: req.body.g_id };
      } else if (from_social == "fb" && !user.fb_id) {
        update_user = { fb_id: req.body.fb_id };
      } else if (from_social == "tw" && !user.tw_id) {
        update_user = { tw_id: req.body.tw_id };
      }
      if (req.body.phone) {
        update_user.phone = req.body.phone;
      }
      if (update_user) {
        await UserModel.update_user(user.id, update_user);
      }
    }

    // checking two factor authentication is enabled or not
    if (await helper.user_2fa_enabled(user.id)) {
      // generate code
      const result = await require("../user_2fa").generate_2fa_code(user.id);
      if (result.success) {
        if (!result.data.tfauth) {
          result.data.tfauth = true;
        }
        return apiResponse.success(res, req, result.data);
      } else {
        return apiResponse.fail(res, result.data);
      }
    } else {
      return apiResponse.success(res, req, tokens);
    }
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.social_user_reg_action = async (req, res, from_social) => {
  let type = null;
  if (from_social == "g") {
    type = "Google";
  } else if (from_social == "fb") {
    type = "Facebook";
  } else if (from_social == "tw") {
    type = "Twitter";
  }

  if (!req.body.fb_id && !req.body.g_id && !req.body.tw_id)
    return apiResponse.fail(res, "There is problem. Please try later.", 500);

  const pass = helper.generate_random_string({ length: 10 });
  const token = helper.generate_verify_token();
  const email_code = helper.generate_random_string({ length: 10 });

  try {
    const password = await helper.setPassword(pass);
    const new_user = {
      password: password,
      mqtt_token: helper.generate_token(10),
      email: req.body.email,
      fb_id: req.body.fb_id || null,
      g_id: req.body.g_id || null,
      phone: req.body.phone || null,
      tw_id: req.body.tw_id || null,
      name: req.body.name,
    };

    if (req.body.new_reg) {
      new_user.email_token = token;
      new_user.status = UsersStatus.inactive;
      new_user.email_code = email_code;
    }

    const created_user = await UserModel.create_user(new_user);

    if (created_user) {
      const tokens = helper.get_user_auth_tokens(req, created_user);

      if (req.body.new_reg) {
        await email.send_registration_email(
          created_user,
          token,
          email_code,
          type,
          pass,
        );

        return apiResponse.success(res, req, "Verified Email");
      } else {
        await email.send_social_registration_email(created_user, pass, type);

        return apiResponse.success(res, req, tokens);
      }
    } else {
      return apiResponse.fail(res, "There is problem. Please try later.", 500);
    }
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_app_title_slug = () => {
  return settings
    .get("company_name")
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
};
