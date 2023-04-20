// External Module Imports
const webPush = require("web-push");

// Configuration Imports
const settings = require("../../config/settings");
const config = require("../../config/config");

// Helper Function Imports
const helper = require("../helper");

// Logger Imports
const { logger } = require("../../logger");

// Services Imports
const UserModel = require("../../services/user");
const UserDeviceModel = require("../../services/user_device");
const PushNotificationsSubscriptionsModel = require("../../services/push_notifications_subscriptions");

// Util Function Imports
const {
  replaceDeviceNamePlaceholder,
  replacePlaceholder,
} = require("./helpers");

try {
  webPush.setVapidDetails(
    `mailto:${config.email.contactEmail}`,
    config.webPush.publicKey,
    config.webPush.privateKey,
  );
} catch (error) {
  logger.error(
    "Webpush config is missing - common/notification/index.js",
    error.message,
  );
}

exports.send = async (params) => {
  const self = this;

  for (let i = 0; i < params.users.length; i++) {
    const user = params.users[i];

    let notice = await replaceDeviceNamePlaceholder(
      params.notice,
      user.id,
      params.device_id || false,
    );

    notice = notice.charAt(0).toUpperCase() + notice.slice(1);

    helper.mqtt_publish_message(
      `u/${user.id}/notices`,
      { notice: notice, misc: params.misc || null },
      false,
    );

    try {
      const result = await PushNotificationsSubscriptionsModel.get(user.id);

      result.forEach((subscription) => {
        self.send_push_notification(subscription.subscription, {
          title: settings.get("company_name"),
          content: notice,
        });
      });
    } catch (error) {
      logger.info(error);
    }

    if (params.fcm_data) {
      self.send_fcm_message({
        message: notice,
        topic: `fcm_${user.id}`,
        data: params.fcm_data,
      });
    }
  }
};

exports.send_to_device_users = async (params) => {
  try {
    const deviceDetails = await UserDeviceModel.getDeviceDetails(
      params.device_id,
    );

    const organizationId = deviceDetails.orgId;
    const deviceName = deviceDetails.device_name;

    const userIds = await UserModel.findUserIdsByOrgId(organizationId);
    const users = userIds.count > 0 ? userIds.ids : [];

    users.forEach(async (user) => {
      try {
        params.users = [{ id: user.id }];

        if (params.notice.indexOf("{device_name}") >= 0) {
          replacePlaceholder({ str: params.notice, replace: deviceName });
        }

        await this.send(params);
      } catch (error) {
        logger.info(error);
      }
    });
  } catch (error) {
    logger.error(error);
  }
};

exports.sendToSuperAdmin = async (params) => {
  try {
    const deviceDetails = await UserDeviceModel.getDeviceDetails(
      params.device_id,
    );

    const deviceName = deviceDetails.device_name;
    const users = await UserModel.getAllSuperAdminIds();

    users.forEach(async (user) => {
      try {
        params.users = [{ id: user.id }];

        if (params.notice.indexOf("{device_name}") >= 0) {
          replacePlaceholder({ str: params.notice, replace: deviceName });
        }

        await this.send(params);
      } catch (error) {
        logger.error(error);
      }
    });
  } catch (error) {
    logger.error(error);
  }
};

exports.send_push_notification = async (sub, notification) => {
  try {
    const pushConfig = {
      endpoint: sub.endpoint,
      keys: {
        auth: sub.keys.auth,
        p256dh: sub.keys.p256dh,
      },
    };

    await webPush.sendNotification(pushConfig, JSON.stringify(notification));
  } catch (err) {
    logger.error("Web Push Notification Err");
    logger.error(err.message);
  }
};

exports.send_fcm_message = async (message) => {
  try {
    return await helper.send_push(message);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
