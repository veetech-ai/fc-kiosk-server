const models = require("../models");
const Device_Admin_Configuration = models.Device_Admin_Configuration;

exports.get_device_admin_configuration = (device_id) => {
  return new Promise((resolve, reject) => {
    Device_Admin_Configuration.findOne({
      where: { device_id: device_id },
    })
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject({ message: err });
      });
  });
};

exports.save_device_admin_configuration = (params) => {
  return new Promise((resolve, reject) => {
    Device_Admin_Configuration.findOne({
      where: { device_id: params.device_id },
    })
      .then((result) => {
        if (result) {
          Device_Admin_Configuration.update(params, {
            where: { device_id: params.device_id },
          })
            .then((result) => {
              resolve(result);
            })
            .catch((err) => {
              reject({ message: err });
            });
        } else {
          Device_Admin_Configuration.create(params)
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
