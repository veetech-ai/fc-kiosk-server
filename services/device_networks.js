const models = require("../models");
const Device_Networks = models.Device_Networks;

const { logger } = require("../logger");

function idExists(user_id, ssid, device_id) {
  return Device_Networks.count({
    where: {
      ssid: ssid,
      device_id: device_id,
    },
  })
    .then((count) => {
      if (count > 0) {
        return true;
      } else {
        return false;
      }
    })
    .catch((err) => {
      logger.error(err);
      return false;
    });
}

module.exports.list = (device_id, perPage = null, page = null) => {
  return new Promise((resolve, reject) => {
    Device_Networks.findAll({
      where: { device_id: device_id },
    })
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

exports.findByWhere = (where) => {
  return new Promise((resolve, reject) => {
    Device_Networks.findOne({
      where: where,
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject({
          message: err,
        });
      });
  });
};

exports.findByID = (id) => {
  return new Promise((resolve, reject) => {
    Device_Networks.findOne({
      where: {
        id: id,
      },
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject({
          message: err,
        });
      });
  });
};

exports.create = async (params) => {
  try {
    const is_exists = await idExists(
      params.user_id,
      params.ssid,
      params.device_id,
    );

    if (is_exists) {
      throw new Error("exists");
    }

    // Create new
    return await Device_Networks.create(params);
  } catch (error) {
    throw new Error({ message: error });
  }
};

exports.delete = (where) => {
  return new Promise((resolve, reject) => {
    Device_Networks.destroy({ where: where })
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject({ message: err });
      });
  });
};
