// External Module Imports
const moment = require("moment");
const axios = require("axios");

// Common Imports
const influxHelper = require("../../common/influxHelper");
const helper = require("../../common/helper");

// Named Services Imports
const {
  getUserIdByDeviceId,
} = require("../../services/organization-fingerprint.service");

// Services Imports
const UserModel = require("../../services/user");
const OrganizationDeviceModel = require("../../services/user_device");
const DeviceModel = require("../../services/device");
const Transactions = require("../../services/transactions");

// Logger Imports
const { logger } = require("../../logger");

// Config Imports
const config = require("../../config/config");

// Helper Functions Imports
const {
  set_diagnostics,
  set_live_status,
  set_history,
  set_group_history,
  setPowerCableData,
  set_device_last_seen,
  attach_device_with_user,
  set_device_firmware,
  set_debug,
  print_label_device,
  set_device_network,
  set_device_admin_config,
  set_tracker_data,
  set_transactional_log,
  update_screen,
  update_approvals,
  set_notification,
  set_tank_data,
  set_energy_data,
  setAlerts,
  transformPowerCableTesterAlerts,
  setDscopeData,
} = require("./helper");

// Controller Function Imports
const { loginDeviceUser } = require("../operator");
const { updateCurrentConfig } = require("../device/device");
const { messageReceived } = require("../remove-data");

exports.deviceAllDiagnosticsData = async (payload) => {
  const deviceId = payload.destinationName.split("/")[1];
  logger.info(`data arrived for device: ${deviceId}`);
  try {
    logger.info("arrived");
    await set_diagnostics(deviceId, payload.payloadString);
  } catch (err) {
    logger.error(err);
  }
};

exports.deviceAllStatus = async (payload) => {
  try {
    const device_id = payload.destinationName.split("/")[1];
    const action = {
      ...JSON.parse(payload.payloadString),
      timestamp: Date.now(),
      deviceId: device_id,
    };

    await set_live_status(action);
  } catch (e) {
    logger.error(e);
  }
};

exports.deviceAllGeyserSet = (payload) => {
  try {
    JSON.parse(payload.payloadString);
    const split = payload.destinationName.split("/");
    const id = split[1];

    if (split[0] == "d") {
      set_history(id, payload.payloadString);
    } else if (split[0] == "g") {
      set_group_history(id, payload.payloadString);
    }
  } catch (e) {
    logger.error(e);
  }
};

exports.deviceAllPowerCableTesters = async (payload) => {
  const deviceId = payload.destinationName.split("/")[1];
  const packet = exports.transformPowerCableData(payload.payloadBytes);
  setPowerCableData(deviceId, packet);
};

exports.deviceAllAr = async (payload) => {
  const deviceId = payload.destinationName.split("/")[1];
  const transformedAlertsData = transformPowerCableTesterAlerts(
    payload.payloadBytes,
  );
  transformedAlertsData.deviceId = deviceId;
  try {
    await setAlerts(deviceId, transformedAlertsData, 1);
  } catch (error) {
    logger.error(error.message);
  }
};

exports.deviceAllAc = async (payload) => {
  const deviceId = payload.destinationName.split("/")[1];
  const transformedAlertsData = transformPowerCableTesterAlerts(
    payload.payloadBytes,
  );
  transformedAlertsData.deviceId = deviceId;
  try {
    await setAlerts(deviceId, transformedAlertsData, 0);
  } catch (error) {
    logger.error(error.message);
  }
};

exports.deviceAllGeyserSettings = async (payload) => {
  try {
    const device_id = payload.destinationName.split("/")[1];
    const device = await DeviceModel.findById(device_id);

    if (device) {
      await set_device_last_seen(
        device,
        JSON.parse(payload.payloadString),
        "ss",
      );
    }
  } catch (e) {
    logger.error(e);
  }
};

exports.usersAttachGeyserDevice = async (payload) => {
  // attach user device
  try {
    JSON.parse(payload.payloadString);
    const user_id = payload.destinationName.split("/")[1];

    await attach_device_with_user(user_id, payload.payloadString);
  } catch (err) {
    // set user attach device fail logs.
    logger.error(err);
  }
};

exports.deviceAllOTA = async (payload) => {
  try {
    const message = JSON.parse(payload.payloadString);
    const device_id = payload.destinationName.split("/")[1];

    await set_device_firmware(device_id, message);
  } catch (e) {
    logger.error(e);
  }
};

exports.debugV0 = async (payload) => {
  try {
    await set_debug(payload.payloadString);
  } catch (e) {
    logger.error(e);
  }
};

exports.debugVP = async (payload) => {
  try {
    set_debug(payload.payloadString, "vp");
  } catch (e) {
    logger.error(e);
  }
};

exports.printLabel = async (payload) => {
  try {
    JSON.parse(payload.payloadString);
    await print_label_device(payload.payloadString);
  } catch (e) {
    logger.error(e);
  }
};

exports.deviceAllNetworksList = async (payload) => {
  try {
    JSON.parse(payload.payloadString);
    const device_id = payload.destinationName.split("/")[1];
    await set_device_network(device_id, payload.payloadString);
  } catch (e) {
    logger.error(e);
  }
};

exports.deviceAllConfigAdmin = async (payload) => {
  try {
    JSON.parse(payload.payloadString);
    const split = payload.destinationName.split("/");
    const id = split[1];
    await set_device_admin_config(id, payload.payloadString);
  } catch (e) {
    logger.error(e);
  }
};

exports.deviceAllGps = async (payload) => {
  try {
    JSON.parse(payload.payloadString);
    const device_id = payload.destinationName.split("/")[1];
    await set_tracker_data(device_id, payload.payloadString);
  } catch (e) {
    logger.error(e);
  }
};

exports.deviceUserLogin = async (payload) => {
  await loginDeviceUser(payload);
};

exports.deviceAllTransactionalLogs = async (payload) => {
  try {
    logger.info("tlog");

    const device_id = payload.destinationName.split("/")[1];
    const type = payload.destinationName.split("/")[3];

    await set_transactional_log(device_id, payload.payloadString, type);
    update_screen(device_id, {
      metrics: "refresh",
      tsm: JSON.parse(payload.payloadString).tsm,
    });

    if (type !== "success") return;

    logger.info(payload.payloadString);
    let transaction;

    const trans = await Transactions.getById({
      id: JSON.parse(payload.payloadString).session_id,
    });

    transaction = trans;

    // if transaction has passport number and it is completed then publish message to respective channel
    // Please refer to update_approvals
    if (transaction.passport_number) {
      update_approvals(device_id, '"success" : "true"');
    }
  } catch (e) {
    logger.error(e);
  }
};

exports.deviceAllHTT = async (payload) => {
  try {
    const deviceId = Number(payload.destinationName.split("/")[1]);
    const packet = exports.transformDscopeData(payload.payloadBytes);
    packet.testResult = "pass";

    await setDscopeData(deviceId, packet);
  } catch (error) {
    logger.error(error.message);
  }
};

exports.userAllNotifications = async (payload) => {
  try {
    JSON.parse(payload.payloadString);
    const split = payload.destinationName.split("/");
    const id = split[1];

    await set_notification(id, payload.payloadString);
  } catch (e) {
    logger.error(e);
  }
};

exports.deviceConfigsRevised = async (payload) => {
  const deviceId = payload.destinationName.split("/")[1];
  await updateCurrentConfig(deviceId, payload.payloadString);
};

exports.trolleyTrackingLocalStatus = async (payload) => {
  if (!config.mqtt.brokerBridgeNotification) return;

  const Time = moment().tz(config.timeZone).format("h:mm:ss A");
  const Date = moment().tz(config.timeZone).format("ll");

  const incomingStatus = parseInt(payload.payloadString);
  if (incomingStatus === global.localBrokerStatus) return;

  global.localBrokerStatus = incomingStatus;

  const message =
    incomingStatus === 1
      ? `Bridge Server \n :white_check_mark: TTS Local Broker Is Now ONLINE at \`${Date}, ${Time} US/Central\``
      : `Bridge Server \n :warning: TTS Local Broker Went OFFLINE at \`${Date}, ${Time} US/Central\``;

  await helper.send_slack(
    message,
    config.mqtt.brokerBridgeNotificationSlackHook,
  );
};

exports.deviceUpdateVersion = async (payload) => {
  try {
    const deviceId = payload.destinationName.split("/")[1];
    const dat = JSON.parse(payload.payloadString);

    await DeviceModel.update_where({ versions: dat }, { id: deviceId });
  } catch (err) {
    logger.error(err);
  }
};

exports.deviceUpdateNew = async (payload) => {
  try {
    const deviceId = payload.destinationName.split("/")[1];
    const dat = JSON.parse(payload.payloadString);

    await DeviceModel.update_where({ device_ip: dat }, { id: deviceId });
  } catch (err) {
    logger.error(err);
  }
};

exports.deviceSetTankData = async (payload) => {
  try {
    JSON.parse(payload.payloadString);
    const device_id = payload.destinationName.split("/")[1];

    await set_tank_data(device_id, payload.payloadString);
  } catch (e) {
    logger.error(e);
  }
};

exports.deviceSetEnergyData = async (payload) => {
  try {
    JSON.parse(payload.payloadString);
    const device_id = payload.destinationName.split("/")[1];

    await set_energy_data(device_id, payload.payloadString);
  } catch (e) {
    logger.error(e);
  }
};

exports.removeDeviceData = async (payload) => {
  await messageReceived(payload.payloadString);
};
