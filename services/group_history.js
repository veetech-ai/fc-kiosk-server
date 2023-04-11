const settings = require("../config/settings");

const models = require("../models");
const Group_History = models.Group_Histories;

exports.get_history_all = (group_id) => {
  return new Promise((resolve, reject) => {
    Group_History.findAll({
      where: { group_id: group_id },
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

exports.get_recent_history = (group_id) => {
  return new Promise((resolve, reject) => {
    Group_History.findAll({
      where: { group_id: group_id },
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

exports.get_history_last = (group_id) => {
  return new Promise((resolve, reject) => {
    Group_History.findOne({
      where: { group_id: group_id },
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
    Group_History.findOne({
      where: { group_id: params.group_id },
      order: [["id", "DESC"]],
    })
      .then((result) => {
        if (result) {
          if (
            (params.action.tsm && params.action.tsm == result.action.tsm) ||
            (params.action.ts && params.action.ts == result.action.ts)
          ) {
            resolve("duplicate");
          } else {
            Group_History.create(params)
              .then((result) => {
                resolve(result);
              })
              .catch((err) => {
                reject({ message: err });
              });
          }
        } else {
          Group_History.create(params)
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

exports.getLastGroupStateChange = async (groupId) => {
  const groupHistory = await Group_History.findOne({
    where: { group_id: groupId },
    order: [["createdAt", "DESC"]],
  });
  return groupHistory;
};
