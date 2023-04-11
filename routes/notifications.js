const config = require("../config/config");
const NotificationsController = require("../controllers/notifications");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}notification`;

  router.get(group + "/all", [
    validation_middleware.validJWTNeeded,
    NotificationsController.get_all,
  ]);
  router.get(group + "/get/:notificationId", [
    validation_middleware.validJWTNeeded,
    NotificationsController.get_by_id,
  ]);

  router.get(group + "/unread", [
    validation_middleware.validJWTNeeded,
    NotificationsController.get_unread,
  ]);

  router.post(group + "/read/:id", [
    validation_middleware.validJWTNeeded,
    NotificationsController.set_read,
  ]);

  router.post(group + "/push-notification", [
    validation_middleware.validJWTNeeded,
    NotificationsController.save_push_notification,
  ]);

  router.post(group + "/send-push-notification-to-all", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super"]),
    NotificationsController.send_push_notification_to_all,
  ]);
};
