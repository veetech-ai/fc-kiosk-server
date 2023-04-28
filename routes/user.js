const config = require("../config/config");
const UsersController = require("../controllers/user/user");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}user`;
  router.post(group + "/register", [UsersController.register]);
  // [ 'super', 'admin', 'getUsers', 'manageUsers' ]
  router.get(group + "/profile", [
    validation_middleware.validJWTNeeded,
    UsersController.get_by_id,
  ]);

  router.get(group + "/get/:userId", [
    validation_middleware.validJWTNeeded,
    UsersController.get_by_id,
  ]);

  router.get(group + "/org/all/:cardSerial/:orgId?", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess([
      "super",
      "admin",
      "getUsers",
      "manageUsers",
    ]),
    UsersController.getAllUsersByCardSerial,
  ]);

  router.put(group + "/update/profile", [
    validation_middleware.validJWTNeeded,
    UsersController.update_user,
  ]);
  router.put(group + "/update/:userId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "manageUsers"]),
    UsersController.updateUserDetails,
  ]);
  router.post(group + "/upload/profile-image", [
    validation_middleware.validJWTNeeded,
    UsersController.upload_profile_image,
  ]);
  router.put(group + "/push-notification-permission", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    UsersController.update_pn_permission,
  ]);

  router.put(group + "/disable/:userId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageUsers"]),
    UsersController.disable_by_id,
  ]);
  router.put(group + "/enable/:userId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageUsers"]),
    UsersController.enable_by_id,
  ]);

  router.get(group + "/all/:organizationId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess([
      "super",
      "admin",
      "getUsers",
      "manageUsers",
    ]),
    validation_middleware.userAccessOwnOrganizationResource,
    UsersController.listByOrganizationId,
  ]);
  router.get(group + "/count/:organizationId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess([
      "super",
      "admin",
      "getUsers",
      "manageUsers",
    ]),
    validation_middleware.userAccessOwnOrganizationResource,
    UsersController.getUserIdsAndCountByOrganizationId,
  ]);

  router.get(group + "/all", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    UsersController.list,
  ]);

  router.get(group + "/all/active", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    UsersController.list_active,
  ]);

  router.get(group + "/selective/:ids", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    UsersController.list_selective,
  ]);

  // Password Routes
  router.post(group + "/change-password/", [
    validation_middleware.validJWTNeeded,
    UsersController.change_password,
  ]);

  router.post(group + "/recover-password-request/", [
    UsersController.recover_password_request,
  ]);

  router.get(group + "/reset-password/", [
    validation_middleware.valid_verify_token,
    UsersController.recover_password,
  ]);

  router.post(group + "/set-password/", [UsersController.set_new_password]);
  // Password Routes end

  // Email Verification
  router.get(group + "/email-verify/", [
    validation_middleware.valid_verify_token,
    UsersController.email_verify,
  ]);

  router.get(group + "/verify-invite-token/", [
    validation_middleware.valid_verify_token,
    UsersController.verify_invite_token,
  ]);

  router.get(group + "/ownership-requests", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess([
      "super",
      "admin",
      "getUsers",
      "manageUsers",
    ]),
    UsersController.get_ownership_requests,
  ]);

  router.post(group + "/ownership-request", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess([
      "super",
      "admin",
      "getUsers",
      "manageUsers",
    ]),
    UsersController.set_ownership_request,
  ]);

  router.get(group + "/share-requests", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess([
      "super",
      "admin",
      "getUsers",
      "manageUsers",
    ]),
    UsersController.get_share_requests,
  ]);

  router.post(group + "/share-request", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess([
      "super",
      "admin",
      "getUsers",
      "manageUsers",
    ]),
    UsersController.set_share_request,
  ]);

  router.get(group + "/get-user-settings", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess([
      "super",
      "admin",
      "getUsers",
      "manageUsers",
    ]),
    UsersController.get_user_settings,
  ]);

  router.post(group + "/set-user-settings", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess([
      "super",
      "admin",
      "getUsers",
      "manageUsers",
    ]),
    UsersController.set_user_settings,
  ]);

  router.post(group + "/send-phone-verification-code", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess([
      "super",
      "admin",
      "getUsers",
      "manageUsers",
    ]),
    UsersController.send_phone_verification_code,
  ]);
  router.post(group + "/verify-phone-verification-code", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess([
      "super",
      "admin",
      "getUsers",
      "manageUsers",
    ]),
    UsersController.verify_phone_verification_code,
  ]);
  router.post(group + "/login/otp", [
    UsersController.send_phone_verification_code_for_app,
  ]);
  router.post(group + "/login/otp/verify", [
    UsersController.verify_phone_verification_code_for_app,
  ]);

  router.get(group + "/last-login-info", [
    validation_middleware.validJWTNeeded,
    UsersController.get_last_login_info,
  ]);

  router.get(group + "/all-login-info", [
    validation_middleware.validJWTNeeded,
    UsersController.get_all_login_info,
  ]);

  router.post(group + "/login-info", [
    validation_middleware.validJWTNeeded,
    UsersController.save_login_info,
  ]);

  router.post(group + "/verify-account", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    UsersController.verifyAccount,
  ]);

  router.get(group + "/get-all-unverified-accounts", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    UsersController.getAllUnverifiedUsers,
  ]);

  router.post(group + "/invite-user", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageUsers"]),
    UsersController.inviteUser,
  ]);

  router.post(group + "/resend-invitation", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageUsers"]),
    UsersController.resendInvitation,
  ]);

  router.post(group + "/complete-registration", [
    validation_middleware.valid_verify_token,
    UsersController.completeRegistration,
  ]);

  router.get(group + "/verify-email-invite-token/", [
    validation_middleware.valid_verify_token,
    UsersController.verifyInviteToken,
  ]);
  router.get(group + "/email-token/:email", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super"]),
    UsersController.getInvitationEmailToken,
  ]);

  router.delete(group + "/delete/:userId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super"]),
    UsersController.delete,
  ]);
};
