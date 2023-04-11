// External Module Imports
const Validator = require("validatorjs");

// Common Imports
const apiResponse = require("../common/api.response");
const notificationHelper = require("../common/notification");

// Services Imports
const NotificationsModel = require("../services/notifications");
const PushNotificationsSubscriptionsModel = require("../services/push_notifications_subscriptions");

// Logger Imports
const { logger } = require("../logger");

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notifications management
 */

exports.get_all = async (req, res) => {
  /**
   * @swagger
   *
   * /notification/all:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get Notifications
   *     tags: [Notifications]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const result = await NotificationsModel.list(req);

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_by_id = async (req, res) => {
  /**
   * @swagger
   *
   * /notification/get/{notificationId}:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get Notification by id
   *     tags: [Notifications]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: Notification ID to read  notification
   *         in: path
   *         required: true
   *         type: number
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const result = await NotificationsModel.findByID(req.params.notificationId);

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_unread = async (req, res) => {
  /**
   * @swagger
   *
   * /notification/unread:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get unread Notifications
   *     tags: [Notifications]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const result = await NotificationsModel.list_unread(req);

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.set_read = async (req, res) => {
  /**
   * @swagger
   *
   * /notification/read/{id}:
   *   post:
   *     security:
   *       - auth: []
   *     description: Read single notification or all notifications.
   *     tags: [Notifications]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: Notification ID or send -1 to read all notifications
   *         in: path
   *         required: true
   *         type: number
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const moment = require("moment");

    if (req.params.id == -1) {
      const result = await NotificationsModel.read_all(req.user.id);

      return apiResponse.success(res, req, result);
    } else {
      const result = await NotificationsModel.update(req.params.id, {
        read_at: moment().utc(),
      });

      return apiResponse.success(res, req, result);
    }
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.send_push_notification_to_all = async (req, res) => {
  /**
   * @swagger
   *
   * /notification/send-push-notification-to-all:
   *   post:
   *     security:
   *      - auth: []
   *     description: Send test notification to all
   *     tags: [Notifications]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: title
   *         description: Notification Title
   *         in: formData
   *         required: true
   *         type: string
   *       - name: description
   *         description: Notification description
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */
  try {
    const result = await PushNotificationsSubscriptionsModel.get();

    const validation = new Validator(req.body, {
      title: "required",
      description: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(function () {
      result.forEach((subscription) => {
        notificationHelper.send_push_notification(subscription.subscription, {
          title: req.body.title,
          content: req.body.description,
        });
      });

      return apiResponse.success(res, req, {
        notifications: "Sent",
        total_subscriptions: result.length,
      });
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.save_push_notification = (req, res) => {
  /**
   * @swagger
   *
   * /notification/push-notification:
   *   post:
   *     security:
   *      - auth: []
   *     description: Set User Web Push Notification.
   *     tags: [Notifications]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: subscription
   *         description: Subscription in JSON String
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */

  Validator.register(
    "json",
    function (value, requirement, attribute) {
      try {
        JSON.parse(value);
      } catch (e) {
        return false;
      }
      return true;
    },
    "The :attribute must be JSON string",
  );

  const validation = new Validator(req.body, {
    subscription: "required|json",
  });

  validation.fails(function () {
    return apiResponse.fail(res, validation.errors);
  });

  validation.passes(async function () {
    try {
      req.body.user_id = req.user.id;

      const result = await PushNotificationsSubscriptionsModel.save(req.body);

      return apiResponse.success(res, req, result);
    } catch (error) {
      apiResponse.fail(res, error.message, 500);
    }
  });
};
