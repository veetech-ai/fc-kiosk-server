const config = require("../config/config");
const TestController = require("../controllers/test");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}test`;

  router.get(group + "/ping/", [TestController.ping]);

  router.post(group + "/email/", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    TestController.email,
  ]);

  router.post(group + "/slack/", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    TestController.slack,
  ]);

  router.post(group + "/twilio-sms/", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    TestController.twilio_sms,
  ]);

  router.get(group + "/generate-token/", [TestController.generate_token]);

  router.get(group + "/routers", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    TestController.get_routers,
  ]);

  router.get(group + "/test-file", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    TestController.get_test_file,
  ]);

  router.post(group + "/test-pdf", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    TestController.create_test_pdf,
  ]);

  router.get(group + "/galexa", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    TestController.get_alexa,
  ]);
  router.post(group + "/palexa", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    TestController.post_alexa,
  ]);

  router.post(group + "/realtime-notice", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    TestController.send_realtime_notification,
  ]);

  router.post(group + "/fcm-push", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    TestController.fcm_push,
  ]);

  router.get(group + "/timezone-conversion", [
    TestController.timezone_conversion,
  ]);
};
