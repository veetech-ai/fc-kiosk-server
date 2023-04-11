const models = require("../models");
const Device_Log_Counts = models.Device_Log_Counts;

module.exports.list = (perPage, page) => {
  return new Promise((resolve, reject) => {
    Device_Log_Counts.findAll()
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
module.exports.list_by_where = (where) => {
  return new Promise((resolve, reject) => {
    Device_Log_Counts.findAll({
      where: where,
    })
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

exports.find_by_where = (where) => {
  return new Promise((resolve, reject) => {
    Device_Log_Counts.findOne({
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

exports.setv0 = (params) => {
  return new Promise((resolve, reject) => {
    const device_id = params.device_id || 0;
    const type = params.type || 1;

    Device_Log_Counts.findOne({
      where: { device_id: device_id },
    })
      .then((result) => {
        if (result) {
          const update = {};
          if (type == 1) {
            update.v0_hp = result.v0_hp + 1;
          } else if (type == 2) {
            update.v0_lp = result.v0_lp + 1;
          } else if (type == 3) {
            update.v0_info = result.v0_info + 1;
          }
          Device_Log_Counts.update(update, { where: { device_id: device_id } })
            .then((result) => {
              resolve(result);
            })
            .catch((err) => {
              reject({ message: err });
            });
        } else {
          const data = {};
          if (type == 1) {
            data.v0_hp = 1;
          } else if (type == 2) {
            data.v0_lp = 1;
          } else if (type == 3) {
            data.v0_info = 1;
          }
          data.device_id = device_id;
          Device_Log_Counts.create(data)
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

exports.setvp = (params) => {
  return new Promise((resolve, reject) => {
    const device_id = params.device_id || 0;
    const type = params.type || 1;

    Device_Log_Counts.findOne({
      where: { device_id: device_id },
    })
      .then((result) => {
        if (result) {
          const update = {};
          if (type == 1) {
            update.vp_hp = result.vp_hp + 1;
          } else if (type == 2) {
            update.vp_lp = result.vp_lp + 1;
          } else if (type == 3) {
            update.vp_info = result.vp_info + 1;
          }
          Device_Log_Counts.update(update, { where: { device_id: device_id } })
            .then((result) => {
              resolve(result);
            })
            .catch((err) => {
              reject({ message: err });
            });
        } else {
          const data = {};
          if (type == 1) {
            data.vp_hp = 1;
          } else if (type == 2) {
            data.vp_lp = 1;
          } else if (type == 3) {
            data.vp_info = 1;
          }
          data.device_id = device_id;
          Device_Log_Counts.create(data)
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
