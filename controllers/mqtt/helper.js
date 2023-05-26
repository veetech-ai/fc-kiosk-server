// External Imports
const struct = require("python-struct");

// Logger Imports
const { logger } = require("../../logger");

// Common Imports
const influxHelper = require("../../common/influxHelper");
const helper = require("../../common/helper");
const notification = require("../../common/notification");
const labelPrinter = require("../../common/label_printer");

// Configuration Imports
const settings = require("../../config/settings");

// Service Imports
const DeviceModel = require("../../services/device");
const GroupModel = require("../../services/user_device_groups");
const UserModel = require("../../services/user");
const UserDeviceGroupsModel = require("../../services/user_device_groups");
const NotificationsModel = require("../../services/notifications");
const DeviceNetworksModel = require("../../services/device_networks");
const UserDeviceSettingsModel = require("../../services/user_device_settings");
const Transaction_Logs = require("../../services/transaction_logs");
const DeviceAdminConfig = require("../../services/device_admin_configuration");
const DeviceHistoryModel = require("../../services/device_history");
const GroupHistoryModel = require("../../services/group_history");
const DeviceWifiModel = require("../../services/device_wifis");
const Transactions = require("../../services/transactions");
const DeviceDiagnosticsModel = require("../../services/device_diagnostics");

const influxSchemaDeviceStatus = require("../../df-commons/influxSchemas/device-status.json");

// Variables Global to this File
const status_timeout = [];

exports.update_screen = async (device_id, action, channel = "screen") => {
  try {
    logger.info(`action :>> ${action}`);

    const device = await DeviceModel.findById(device_id);
    if (device) {
      const orgId = device.owner_id;
      action.deviceType = device.device_type;
      action.deviceId = device.id;

      helper.mqtt_publish_message(`u/${orgId}/${channel}`, { action }, false);
    }
    return;
  } catch (err) {
    logger.error(err);
  }
};

exports.attach_device_with_user = async (user_id, message) => {
  const device_serial = JSON.parse(message).serial;

  try {
    const user = await UserModel.find_by_where({ id: user_id });
    if (!user) return; // user not found, user mqtt token may invalid

    const { device } = await DeviceModel.deviceTransferValidations({
      device_serial,
      email_for_device_transfer: user.email,
    });

    await DeviceModel.verify_transfer_token(
      { action: true, orgId: user.orgId },
      { id: device.id },
    );
  } catch (error) {
    if (error == "exists") {
      // already registered
    } else {
      // user not found, user mqtt token may invalid OR
      // device not found, serial may be invalid OR
      // device owner not set and also device not attach
      // device not attached with user but only owner set
      logger.error(error);
    }
  }
};

exports.set_device_admin_config = async (device_id, config) => {
  try {
    const device = await DeviceModel.findById(device_id);
    if (!device) return;

    await DeviceAdminConfig.save_device_admin_configuration({
      device_id: device.id,
      config: config,
    });
  } catch (error) {
    logger.error(error);
  }
};

exports.set_history = async (device_id, action) => {
  try {
    const device = await DeviceModel.findById(device_id);
    if (!device) return;

    helper.set_time_series_data(
      {
        device_id: device.id,
        fields: {
          t: parseInt(JSON.parse(action).t),
        },
      },
      "history",
    );

    await this.set_device_last_seen(device, JSON.parse(action), "set");
    await DeviceHistoryModel.save_history({
      device_id: device.id,
      action: action,
    });
  } catch (error) {
    logger.error(error);
  }
};

exports.set_group_history = async (group_id, action) => {
  try {
    const group = await UserDeviceGroupsModel.get_by_where_single({
      id: group_id,
    });

    if (!group) return;

    await GroupHistoryModel.save_history({
      group_id: group.id,
      action: action,
    });
  } catch (error) {
    logger.error(error);
  }
};

exports.set_notification = async (user_id, action) => {
  try {
    const user = await UserModel.findById(user_id);
    if (!user) return;

    action = JSON.parse(action);

    const result = await NotificationsModel.create({
      notice: action.notice,
      misc: action.misc,
      user_id: user_id,
    });

    helper.mqtt_publish_message(`u/${user_id}/wnotices`, {
      notice: true,
      data: result,
    });
  } catch (error) {
    logger.error(error);
  }
};

exports.updateScreenBasedOnUserId = async ({
  action,
  channel = "screen",
  userId,
}) => {
  try {
    logger.info("action");
    logger.info(action);

    const user = await UserModel.findById(userId);

    if (user) {
      const orgId = user.orgId;
      helper.mqtt_publish_message(`u/${orgId}/${channel}`, { action }, false);
    }
  } catch (err) {
    throw new Error(err);
  }
};

exports.update_approvals = async (device_id, action) => {
  try {
    const device = await DeviceModel.findById(device_id);
    if (!device) return;

    if (device) {
      const userId = device.owner_id;

      try {
        action = JSON.parse(action);
      } catch {
        action = {};
      }

      // reload the approvals at frontend once a new completed transaction with passport number(approval) arrives.
      // subscribed at admin-frontend and re-get the approvals on message arrived at below mentioned channel
      helper.mqtt_publish_message("u/admins/approval", { action }, false);
      helper.mqtt_publish_message(`u/${userId}/approval`, { action }, false);

      return;
    }
  } catch (err) {
    throw new Error(err);
  }
};

const setPreferredWifiChannel = async (message, device) => {
  try {
    if (typeof message.wifipreferredChannel !== "undefined") {
      const data = {
        device_id: device.id,
        device_serial: device.serial,
        preferred_channel: message.wifipreferredChannel || null,
        current_channel: message.wifiChannel || null,
        wifi_ip: message.ip || null,
        wifi_ssid: message.wifi || null,
      };

      await DeviceWifiModel.save_wifi(data);
    }
  } catch (error) {
    logger.error(error);
  }
};
exports.setPreferredWifiChannel = setPreferredWifiChannel;

// set device online and offline status in influx db
exports.set_live_status = async (action) => {
  // save status data in influxdb
  if ("status" in action) {
    action.status = action.status === "online" ? 1 : 0;
    const device = await DeviceModel.findById(action.deviceId);
    if (!device) return;
    const inserted = await DeviceModel.set_live_status(
      device.id,
      action.status ? true : false,
    );
    if (!inserted[0]) return false;
    const isDataInserted = await influxHelper.insertInfluxData(
      {
        ...action,
      },
      influxSchemaDeviceStatus,
    );
    setPreferredWifiChannel(action, device);

    return isDataInserted ? true : false;
  }
};

exports.setDeviceLastUpdated = async (deviceId, payload, topic) => {
  try {
    const device = await DeviceModel.findById(deviceId);
    if (!device) return;

    if (!payload.ts && !payload.tsm) return;

    let update_lst = true;
    let o_ls_date = null;

    const timestamp = payload.tsm ? payload.tsm / 1000 : payload.ts;
    const n_ls_date = new Date(timestamp).getTime();

    if (device.lst) {
      o_ls_date = new Date(device.lst).getTime();

      if (n_ls_date <= o_ls_date) {
        update_lst = false;
      }
    }

    if (update_lst) {
      await DeviceModel.update_where(
        { lst: n_ls_date, topic },
        { id: deviceId },
      );
    }
  } catch (error) {
    logger.error(error.message);
  }
};

exports.set_diagnostics = async (deviceId, action) => {
  action = JSON.parse(action);
  // save diagnostic data in influxdb
  /// TODO: make schema first for this
  // const result = await influxHelper.insertInfluxData(
  //   {
  //     ...action,
  //     deviceId
  //   },
  //   influxSchemaDiagnosticData
  // )

  // if (result) {
  //   update_screen(deviceId, { metrics: 'refresh', ts: action.ts }).catch(
  //     () => { }
  //   )
  // }
  await this.setDeviceLastUpdated(deviceId, action, "diagnostic_data");
};

exports.setInfluxData = async (action, schema) => {
  try {
    const isDataInserted = await influxHelper.insertInfluxData(
      {
        ...action,
      },
      schema,
    );

    if (isDataInserted) {
      if (action.userId) {
        await this.updateScreenBasedOnUserId({
          action: { metrics: "refresh", ts: action.ts },
          userId: action.userId,
        });
      } else if (action.deviceId) {
        await this.updateScreenBasedOnDeviceId({
          action: { metrics: "refresh", ts: action.ts },
          deviceId: action.deviceId,
        });
      }
    }

    if (action.deviceId) {
      const device = await DeviceModel.findById(action.deviceId);
      if (device) {
        await this.set_device_last_seen(device, action, "wd");
      }
    }
  } catch (error) {
    logger.error(error);
  }
};

exports.set_device_status = async (message, device) => {
  try {
    clearTimeout(status_timeout[device.id]);
    message = JSON.parse(message);

    let status = false;
    if (typeof message.status !== "undefined") {
      if (message.ts && typeof message.ts !== "undefined") {
        const old_ts = new Date(message.ts);

        status_timeout[device.id] = setTimeout(() => {
          const now = new Date(helper.ts_now());
          const seconds = Math.floor(now.getTime() - old_ts.getTime());

          if (seconds < settings.get("device_offline_interval_forcefully")) {
            status = true;
          } else {
            status = false;
            helper.set_device_forcefully_status(device.id, "offline", false);
          }

          clearTimeout(status_timeout[device.id]);
        }, settings.get("device_offline_interval_forcefully") * 1000);
      } else {
        status = message.status == "online";
      }
    }

    if (status != device.live_status) {
      await DeviceModel.set_live_status(device.id, status);
    }
  } catch (err) {
    logger.error(err);
  }
};

exports.set_debug = async (payload, type = "v0") => {
  try {
    switch (type) {
      case "v0":
        await helper.set_debugv0(payload);
        break;
      case "vp":
        await helper.set_debugvp(payload);
        break;
      default:
        break;
    }
  } catch (err) {
    logger.error(err.message);
  }
};

exports.set_device_firmware = async (id, message) => {
  try {
    const device = await DeviceModel.findById_with_select(id, ["new_fv", "fv"]);
    if (!device) return;

    const update = {
      fv: message.v || message.version,
      hw_ver: message.hwv ?? null,
    };

    const old_version = device.fv;

    if (update.fv == device.new_fv) {
      update.new_fv = null;
    }

    if (parseInt(message.ota) == 1 || parseInt(message.ota) == 2) {
      update.fv_update_state = parseInt(message.ota);
    }

    await DeviceModel.update_where(update, { id });
    await DeviceModel.fv_count_update(update.fv, old_version);
  } catch (error) {
    logger.error(error);
  }
};

/// TODO: refactor is needed here
exports.set_device_last_seen = async (device, payload, topic) => {
  if (payload.ts) {
    let update_lst = true;

    let o_ls_date = null;
    const n_ls_date = new Date(payload.ts).getTime();

    if (device.lst) {
      o_ls_date = new Date(device.lst).getTime();

      if (n_ls_date <= o_ls_date) {
        update_lst = false;
      }
    }

    if (update_lst) {
      await DeviceModel.update_where({ lst: n_ls_date }, { id: device.id });
    }
  }
};

exports.print_label_device = async (payload) => {
  try {
    const message = JSON.parse(payload);
    const device = await DeviceModel.findBySerial_simple(message.serial, [
      "id",
      "serial",
      "hw_ver",
      "pin_code",
      "createdAt",
    ]);

    if (!device) return;

    if (device) {
      labelPrinter.print(device, message);
    }
  } catch (err) {
    logger.error(err);
  }
};

// Water tank data
exports.set_tank_data = async (device_id, action) => {
  try {
    const device = await DeviceModel.findById_with_settings(device_id);
    if (!device) return;

    const tank_data = JSON.parse(action);
    await helper.set_time_series_data_with_ts(
      {
        device_id: device_id, // device.id
        fields: tank_data,
      },
      "tank_data",
    );

    const level_percent = parseFloat(tank_data.level_percent || -1);
    if (level_percent <= 0) return;

    if (
      !device.Settings ||
      !device.Settings.settings ||
      !device.Settings.settings.Halert
    )
      return;

    const device_settings = JSON.parse(
      JSON.stringify(device.Settings.settings),
    );

    const threshold = parseFloat(device_settings.Halert);

    if (level_percent <= threshold) {
      if (device_settings.wl_notified) return;

      await notification.send_to_device_users({
        device_id: device.id,
        notice: `{device_name} has low water level (${level_percent}%).`,
        fcm_data: {
          d_id: device.id.toString(),
          d_type: device.device_type.toString(),
          n_type: "tk_wl",
          click_action: "FLUTTER_NOTIFICATION_CLICK",
        },
      });

      device_settings.wl_notified = true;
      device.Settings.settings = JSON.stringify(device_settings);

      await UserDeviceSettingsModel.save_settings(
        device.Settings,
        device.Settings.user_id,
        device.id,
      );

      helper.mqtt_publish_message(`d/${device.id}/gs/config`, device_settings);
    } else {
      // resetting notified settings
      if (!device_settings.wl_notified) return;

      device_settings.wl_notified = false;
      device.Settings.settings = JSON.stringify(device_settings);

      await UserDeviceSettingsModel.save_settings(
        device.Settings,
        device.Settings.user_id,
        device.id,
      );

      helper.mqtt_publish_message(`d/${device.id}/gs/config`, device_settings);
    }
  } catch (error) {
    logger.error("set_tank_data catch");
    logger.error(error.message);
  }
};

// tracker data
exports.set_tracker_data = async (device_id, action) => {
  const actions = JSON.parse(action);

  if (actions.long) {
    actions.lng = actions.long;
  }

  await helper.set_time_series_data_with_ts(
    {
      device_id: device_id,
      fields: actions,
    },
    "tracker_data",
  );
};

exports.set_energy_data = (device_id, action) => {
  try {
    // DeviceModel.findById(device_id).then((device) => {
    //     if(device){
    action = JSON.parse(action);

    const time_interval = 600; // 10 minutes
    let new_timestamp = action.ts;
    const length = action.energy_kwh
      ? action.energy_kwh.length
      : action.energy.length;

    for (let i = length - 1; i >= 0; i--) {
      let energy = null;
      let pulse = null;
      let energy_kvarh = null;
      let pulses_kvarh = null;

      if (action.energy_kwh) {
        energy = action.energy_kwh[i];
        pulse = action.pulses_kwh[i];
      } else if (action.energy) {
        energy = action.energy[i];
        pulse = action.pulses[i];
      }

      if (action.energy_kvarh) {
        energy_kvarh = action.energy_kvarh[i];
        pulses_kvarh = action.pulses_kvarh[i];
      }

      const data = {
        device_id: device_id,
        fields: {
          energy: energy,
          pulse: pulse,
          energy_kvarh: energy_kvarh,
          pulses_kvarh: pulses_kvarh,
          ts: new_timestamp,
        },
      };

      if (i == length - 1) {
        if (action.kwh_cons) {
          data.fields.kwh_cons_1d = action.kwh_cons_1d;
          data.fields.kwh_cons_1m = action.kwh_cons_1m;
          data.fields.kwh_cons = action.kwh_cons;
          data.fields.kvarh_cons_1d = action.kvarh_cons_1d;
          data.fields.kvarh_cons_1m = action.kvarh_cons_1m;
          data.fields.kvarh_cons = action.kvarh_cons;
        }
      }

      helper.set_time_series_data_with_ts(data, "energy_data");

      new_timestamp -= time_interval;
    }
    //     }
    // }).catch(() => {});
  } catch (err) {
    logger.error(err);
  }
};

exports.set_device_network = async (device_id, action) => {
  try {
    const device = await DeviceModel.findById(device_id);
    if (!device) return;

    const networks = JSON.parse(
      action
        .replace(/"s"/g, '"ssid"')
        .replace(/"n"/g, '"priority"')
        .replace(/"p"/g, '"password"'),
    );

    await DeviceNetworksModel.delete({ device_id: device_id });

    networks.forEach(async (network) => {
      try {
        network.user_id = device.owner_id;
        network.device_id = device_id;
        await DeviceNetworksModel.create(network);
      } catch (error) {
        logger.error(error.message);
      }
    });
  } catch (error) {
    logger.error(`Network list error ${error}`);
  }
};

exports.set_transactional_log = async (device_id, action, type) => {
  try {
    action = JSON.parse(action);
    const { data, session_id } = action;
    const data1 = {
      ...data,
    };

    if (data.endedAt) {
      delete data1.endedAt;
    }

    await Transaction_Logs.save({
      type,
      data1,
      session_id,
      device_id,
    });

    logger.info(type);
    logger.info(action);
    /**
     * NOTE: -1 mean param was not passed from frontend
     */
    const params = {};

    if (data.time_spent) {
      params.time_spent = data.time_spent;
    } else {
      delete params.time_spent;
    }

    if (data.endedAt) {
      params.endedAt = data.endedAt;
    } else {
      delete params.endedAt;
    }

    if (data.screen) {
      params.screen_number = data.screen;
    } else {
      delete params.screen_number;
    }

    if (type == "new") {
      params.type = type;
      params.time_spent = 0;
    }

    if (type == "success") {
      params.status = "success";
      params.type = data.type;
      params.service = data.type; // type of service new sim, duplicate sim etc
      params.time_spent = data.time_spent;
      params.screen_number = data.screen;
      if (data.type === "duplicate_sim" || data.type === "new_sim") {
        await DeviceModel.sim_dispensed(device_id);
      }
    }

    if (type == "package_selection") {
      params.package_name = data.packageName;
      params.screen_number = data.screen;
    }

    if (type == "cancelled") {
      params.status = "cancelled";
      params.screen_number = data.screen;
    }

    if (type == "feedback_score") {
      params.feedback = data.score || -1;
      params.status = "success";
    }

    if (type == "failed") {
      params.fault = data.reason || -1;
      params.status = "failed";
      params.screen_number = data.screen;
    }

    if (type == "timeout") {
      params.status = "timeout";
      params.screen_number = data.screen;
    }
    if (type == "rejected") {
      params.fault = data.reason || -1;
      params.status = "rejected";
      params.screen_number = data.screen;
    }
    if (type == "pending") {
      params.status = "pending";
      params.screen_number = data.screen;
    }
    if (type == "IMSI") {
      params.IMSI = data.IMSI;
    }
    if (type == "screen_time") {
      if (data.screen == 3) {
        // service selection screen
        if (data.service_name) {
          params.service = data.service_name;
        } else {
          delete params.service;
        }
        delete params.time_spent; // only in package_selection case
      }
      if (data.screen == 4) {
        // cnic screen
        params.cnic = data.cnic || -1;
      }
      if (data.screen == 2) {
        // language screen
        params.language = data.language || -1;
      }
      if (data.screen == 5) {
        // billing screen
        params.billing = data.billing || -1;
      }
      if (data.screen == 19) {
        // passport screen
        params.passport_number = data.passport || -1;
      }
    }

    if (
      type == "number_choosen" ||
      type == "number_selection" ||
      data.screen == 6 ||
      data.screen == 15
    ) {
      params.mobile_number = data.number || -1;
      if (type == "number_choosen") {
        params.number_selection = "list";
      }
      if (type == "number_selection") {
        params.number_selection = "advance";
      }
    }

    // Do not post if object is empty
    /// TODO: add missing events
    if (Object.entries(params).length !== 0) {
      logger.info("Transactions.modifiy(params, {");
      logger.info(params);
      await Transactions.save({
        session_id,
        data: params,
        device_id,
      });
    }
  } catch (err) {
    logger.error(`Error: set_transactional_log ${err.message}`);
  }
};

exports.setAlerts = async (deviceId, alertsDataParam, raiseOrClear = 1) => {
  // 0 to clear and 1 to raise alert
  const acceptedValues = [0, 1];
  if (!acceptedValues.includes(raiseOrClear)) {
    return "Invalid argument value";
  }

  try {
    const alerts = {};
    const transformedAlertsDataForInflux = { ...alertsDataParam };

    const device = await DeviceModel.findById(deviceId);
    if (!device) {
      logger.error("device not found");
      return;
    }

    const alertsData =
      helper.schemasPerDeviceType[device.device_type].alertsData;
    const alertsSchema =
      helper.schemasPerDeviceType[device.device_type].alertsSchema;

    const alert = alertsData.find(
      (alert) => alert.code === transformedAlertsDataForInflux.code,
    );

    if (!alert) {
      throw new Error(
        `*** Alert with code <${transformedAlertsDataForInflux.code}>, not found in the specified schema ***`,
      );
    }

    const alertName = alert.name;
    alerts[`${alertName}`] = raiseOrClear;
    transformedAlertsDataForInflux[`${alertName}`] = raiseOrClear;

    const validationResponse = helper.validateDataWithSchema(
      alertsSchema,
      alerts,
    );

    if (!validationResponse.isValidated) {
      throw new Error(
        `*** Alert with code <${transformedAlertsDataForInflux.code}>, not found in the specified schema ***`,
      );
    }

    await DeviceDiagnosticsModel.save_diagnostics({
      deviceId,
      alerts: { ...alerts },
      timestamp:
        transformedAlertsDataForInflux.tsm || transformedAlertsDataForInflux.ts,
      alertsSchema,
      alertsData,
    });

    const deviceAlertsInfluxSchema =
      helper.schemasPerDeviceType[device.device_type].alertsInfluxSchema;

    await influxHelper.insertInfluxData(
      transformedAlertsDataForInflux,
      deviceAlertsInfluxSchema,
    );

    return;
  } catch (error) {
    logger.error(error.message);
    return;
  }
};

exports.transformPowerCableTesterAlerts = (byteArray) => {
  const decodingPattern = "Qb";

  const unpackedData = struct.unpack(
    decodingPattern,
    Buffer.from(byteArray),
    false,
  );

  const formattedData = {
    tsm: Number(unpackedData[0]),
    code: Number(unpackedData[1]),
  };

  return formattedData;
};

exports.updateScreenBasedOnDeviceId = async ({
  action,
  channel = "screen",
  deviceId,
}) => {
  try {
    const device = await DeviceModel.findById(deviceId);
    if (!device) return;

    const orgId = device.owner_id;

    action.deviceId = deviceId;
    action.deviceType = device.device_type;

    helper.mqtt_publish_message(`u/${orgId}/${channel}`, { action }, false);

    if (action.ts)
      await DeviceModel.update_where(
        { lst: action.ts || action.tsm / 1000 },
        { id: action.deviceId },
      );
  } catch (err) {
    throw new Error(err);
  }
};

exports.updateScreenBasedOnGroupId = async ({
  action,
  channel = "screen",
  groupId,
}) => {
  try {
    const group = await GroupModel.get_by_where_single({ id: groupId });
    if (!group) return;

    const orgId = group.orgId;

    action.groupId = groupId;

    helper.mqtt_publish_message(`u/${orgId}/${channel}`, { action }, false);
  } catch (err) {
    throw new Error(err);
  }
};

exports.getFirstMatch = (string, regex) => {
  const matched = string.match(regex);
  if (matched != null) {
    return { value: matched[0], length: matched[0].length };
  }
  return { value: undefined, length: 0 };
};
