const models = require("../models");
const moment = require("moment");
const Device_Diagnostics = models.Device_Diagnostics;
const helper = require("../common/helper");

const { logger } = require("../logger");

exports.get_device_diagnostics = (device_id, attributesToInclude = []) => {
  const options = {
    where: {
      device_id: device_id,
    },
  };
  if (
    attributesToInclude &&
    attributesToInclude.length &&
    attributesToInclude.length > 0
  ) {
    options.attributes = attributesToInclude;
  }
  return new Promise((resolve, reject) => {
    Device_Diagnostics.findOne({ ...options })
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject({
          message: err.message,
        });
      });
  });
};

exports.save_diagnostics = ({
  deviceId,
  alerts,
  timestamp,
  alertsSchema,
  alertsData,
  overide = false,
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const validationResponse = helper.validateDataWithSchema(
        alertsSchema,
        alerts,
      );
      if (!validationResponse.isValidated) {
        return reject({
          message: validationResponse,
        });
      }
      const deviceDiagnostics = await this.get_device_diagnostics(deviceId);
      let { alertsCategoriesIndications } =
        helper.getAlertsCategoriesAndIndications();
      const slackAlertsNames = [];
      if (deviceDiagnostics) {
        Object.keys(alerts).forEach((alert) => {
          if (
            deviceDiagnostics[`${alert}UpdatedAt`] &&
            alert in deviceDiagnostics
          ) {
            if (
              moment(deviceDiagnostics[`${alert}UpdatedAt`]).valueOf() >=
              timestamp
            )
              delete alerts[alert];
            else alerts[`${alert}UpdatedAt`] = timestamp;
          } else {
            slackAlertsNames.push(alert);
          }
        });
        if (slackAlertsNames.length > 0) {
          logger.info(
            `<*** ${slackAlertsNames.join(",")} ***> not found in the database`,
          );
          // TODO slack notification
        }
        if (Object.keys(alerts).length === 0) {
          return resolve("Data already update to date");
        }
        const response = await Device_Diagnostics.update(alerts, {
          where: { deviceId: deviceId },
        });
        if (response[0]) {
          const updatedResult = await this.get_device_diagnostics(deviceId);
          // send_device_diagnostics_notification(deviceId, alerts)
          try {
            alertsCategoriesIndications = await helper.set_indicator(
              deviceId,
              updatedResult,
              alertsData,
            );
          } catch (error) {
            // TODO slack notification if error occurs
          }
          helper.publish_diagnostic_message(
            deviceId,
            alerts,
            alertsCategoriesIndications,
            alertsData,
          );
          resolve(updatedResult);
        } else {
          return resolve("Data already update to date");
        }
      } else {
        Object.keys(alerts).forEach((alert) => {
          if (alert in models.Device_Diagnostics.rawAttributes)
            alerts[`${alert}UpdatedAt`] = timestamp;
          else {
            delete alerts[alert];
            slackAlertsNames.push(alert);
          }
        });
        if (slackAlertsNames.length > 0) {
          logger.info(
            `<*** ${slackAlertsNames.join(",")} ***> not found in the database`,
          );
          // TODO slack notification
        }
        if (Object.keys(alerts).length === 0) {
          return reject({
            message: `${slackAlertsNames.join(",")} not found in the database`,
          });
        }
        const dataToCreate = { deviceId, ...alerts };
        const newDeviceDiagnostics = await Device_Diagnostics.create(
          dataToCreate,
        );
        // send_device_diagnostics_notification(params, false)

        try {
          alertsCategoriesIndications = await helper.set_indicator(
            deviceId,
            newDeviceDiagnostics,
            alertsData,
          );
        } catch (error) {
          // TODO slack notification if error occurs
        }
        helper.publish_diagnostic_message(
          deviceId,
          alerts,
          alertsCategoriesIndications,
          alertsData,
        );

        resolve(newDeviceDiagnostics);
      }
    } catch (error) {
      logger.error(error);
      reject(error);
    }
  });
};

// function send_device_diagnostics_notification (params, old_params) {
//   if (params.no_charging && (!old_params || !old_params.no_charging)) {
//     notification.send_to_device_users({ device_id: params.device_id, notice: '{device_name} is not charging.' })
//   }
//   if (params.vbat_alert && (!old_params || !old_params.vbat_alert)) {
//     notification.send_to_device_users({ device_id: params.device_id, notice: 'Battery is low of {device_name}.' })
//   }

//   if (params.encoder_miss && (!old_params || !old_params.encoder_miss)) {
//     notification.send_to_device_users({
//       device_id: params.device_id,
//       notice: 'Position Sensor error in {device_name}.'
//     })
//   }

//   if (params.h_bridge_fault && (!old_params || !old_params.h_bridge_fault)) {
//     notification.send_to_device_users({
//       device_id: params.device_id,
//       notice: 'Motor Driver fault in {device_name}.'
//     })
//   }

//   if (params.over_current && (!old_params || !old_params.over_current)) {
//     notification.send_to_device_users({
//       device_id: params.device_id,
//       notice: 'Motor is drawing high current in {device_name}.'
//     })
//   }

//   if (params.home_miss && (!old_params || !old_params.home_miss)) {
//     notification.send_to_device_users({
//       device_id: params.device_id,
//       notice: 'Position Sensor error in {device_name}.'
//     })
//   }

//   if (params.encoder_timeout && (!old_params || !old_params.encoder_timeout)) {
//     notification.send_to_device_users({
//       device_id: params.device_id,
//       notice: 'Thermostat is jaming of {device_name}.'
//     })
//   }

//   if (params.motor_missing && (!old_params || !old_params.motor_missing)) {
//     notification.send_to_device_users({
//       device_id: params.device_id,
//       notice: 'No Motor attached with {device_name}.'
//     })
//   }
// }
