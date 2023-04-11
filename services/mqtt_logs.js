const models = require("../models");
const Mqtt_Logs = models.Mqtt_Logs;

module.exports.list = (perPage, page) => {
  return new Promise((resolve, reject) => {
    Mqtt_Logs.findAll()
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
    Mqtt_Logs.findOne({
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
    // Create new
    Mqtt_Logs.create(params)
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject({ message: err });
      });
  });
};
