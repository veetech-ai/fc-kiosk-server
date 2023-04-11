const models = require("../models");
const Geofences = models.Geofences;

module.exports.list = (user_id, perPage, page) => {
  return new Promise((resolve, reject) => {
    Geofences.findAll({
      where: { user_id: user_id },
      include: [
        {
          as: "User_Device_settings",
          model: models.Organization_Device_settings,
          // where: {user_id: user_id},
          require: false,
          attributes: ["settings"],
          include: [
            {
              as: "Device",
              model: models.Device,
              require: false,
              attributes: [
                "id",
                "serial",
                "live_status",
                "bill_cleared",
                "enable_bill",
              ],
              include: [
                {
                  as: "User_Devices",
                  model: models.User_Device,
                  require: false,
                  where: { user_id: user_id },
                  attributes: ["device_name"],
                },
              ],
            },
          ],
        },
      ],
    })
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

exports.findByID = (id) => {
  return new Promise((resolve, reject) => {
    Geofences.findOne({
      where: { id: id },
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject({ message: err });
      });
  });
};

exports.create = (params) => {
  return new Promise((resolve, reject) => {
    Geofences.create(params)
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject({ message: err });
      });
  });
};

exports.update = (id, params) => {
  return new Promise((resolve, reject) => {
    Geofences.update(params, { where: { id: id } })
      .then((result) => {
        if (result) {
          resolve(result);
        } else {
          reject("There is a problem. Please try later.");
        }
      })
      .catch((err) => {
        reject({ message: err });
      });
  });
};

exports.delete = (id, params) => {
  return new Promise((resolve, reject) => {
    Geofences.destroy({ where: { id: id } })
      .then((result) => {
        if (result) {
          resolve(result);
        } else {
          reject("There is a problem. Please try later.");
        }
      })
      .catch((err) => {
        reject({ message: err });
      });
  });
};
