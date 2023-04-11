const { getKeysWithChangedValues } = require("../common/helper");
const settings = require("../config/settings");

const models = require("../models");
const Device_History = models.Device_History;

exports.get_device_history_all = (device_id) => {
  return new Promise((resolve, reject) => {
    Device_History.findAll({
      where: { device_id: device_id },
      limit: parseInt(settings.get("device_history_limit") || 200),
      order: [["id", "DESC"]],
    })
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject({ message: err });
      });
  });
};

exports.get_device_recent_history = (device_id) => {
  return new Promise((resolve, reject) => {
    Device_History.findAll({
      where: { device_id: device_id },
      order: [["id", "DESC"]],
      limit: parseInt(settings.get("recent_device_history_limit") || 10),
    })
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject({ message: err });
      });
  });
};

exports.get_device_history_last = (device_id) => {
  return new Promise((resolve, reject) => {
    Device_History.findOne({
      where: { device_id: device_id },
      order: [["id", "DESC"]],
    })
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject({ message: err });
      });
  });
};

exports.save_history = (params) => {
  return new Promise((resolve, reject) => {
    Device_History.findOne({
      where: { device_id: params.device_id },
      order: [["id", "DESC"]],
    })
      .then((result) => {
        const keysToExclude = ["tsm", "ton", "toff", "groupId"];
        if (result) {
          if (
            (params.action.tsm && params.action.tsm == result.action.tsm) ||
            (params.action.ts && params.action.ts == result.action.ts)
          ) {
            resolve("duplicate");
          } else {
            const performedActionsKeys = Object.keys(
              getKeysWithChangedValues(
                params.action,
                result?.action || {},
                keysToExclude,
              ),
            );
            params.performedActionsKeys = performedActionsKeys;
            Device_History.create(params)
              .then((result) => {
                resolve(result);
              })
              .catch((err) => {
                reject({ message: err });
              });
          }
        } else {
          const performedActionsKeys = Object.keys(
            getKeysWithChangedValues(
              params.action,
              result?.action || {},
              keysToExclude,
            ),
          );
          params.performedActionsKeys = performedActionsKeys;
          Device_History.create(params)
            .then((result) => {
              resolve(result);
            })
            .catch((err) => {
              reject({ message: err });
            });
        }
      })
      .catch((err) => {
        reject({ message: err });
      });
  });
};
