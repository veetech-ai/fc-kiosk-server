const models = require("../models");
const Device_Encoder_Times = models.Device_Encoder_Times;

exports.get_all = (device_id, cols = false) => {
  return new Promise((resolve, reject) => {
    const query = {
      where: { device_id: device_id },
    };
    if (cols) {
      query.attributes = cols;
    }

    Device_Encoder_Times.findAll(query)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject({ message: err.message });
      });
  });
};

exports.save = (params) => {
  return new Promise((resolve, reject) => {
    Device_Encoder_Times.findOne({
      where: {
        device_id: params.device_id,
        start: params.start,
        end: params.end,
      },
    })
      .then((result) => {
        if (result) {
          Device_Encoder_Times.update(params, {
            where: {
              device_id: params.device_id,
              start: params.start,
              end: params.end,
            },
          })
            .then((result) => {
              resolve(result);
            })
            .catch((err) => {
              reject({ message: err.message });
            });
        } else {
          Device_Encoder_Times.create(params)
            .then((result) => {
              resolve(result);
            })
            .catch((err) => {
              reject({ message: err.message });
            });
        }
      })
      .catch((err) => {
        reject({ message: err });
      });
  });
};
