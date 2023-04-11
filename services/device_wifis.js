const models = require("../models");
const Device_Wifis = models.Device_Wifis;

exports.get_device_wifi = (device_ids) => {
  return new Promise((resolve, reject) => {
    Device_Wifis.findAll({
      where: { device_id: device_ids },
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

exports.save_wifi = (params) => {
  return new Promise((resolve, reject) => {
    Device_Wifis.findOne({
      where: { device_id: params.device_id },
    })
      .then((result) => {
        if (result) {
          Device_Wifis.update(params, {
            where: { device_id: params.device_id },
          })
            .then((result) => {
              resolve(result);
            })
            .catch((err) => {
              reject({ message: err });
            });
        } else {
          Device_Wifis.create(params)
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
