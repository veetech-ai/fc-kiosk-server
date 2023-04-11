const models = require("../models");
const Fv_Resets = models.Fv_Resets;
const FvReportsModel = require("../services/fv_reports");

const { logger } = require("../logger");

function get_total_resets(fv) {
  return new Promise((resolve, reject) => {
    Fv_Resets.findOne({
      attributes: [
        [
          models.sequelize.fn("SUM", models.sequelize.col("Fv_Resets.resets")),
          "total_resets",
        ],
      ],
      where: { fv: fv },
      raw: true,
      group: ["Fv_Resets.fv"],
    })
      .then((total) => {
        FvReportsModel.setv0({ fv: fv, resets: total.total_resets })
          .then((result) => {})
          .catch((err) => {
            logger.error(err);
          });
        resolve(total);
      })
      .catch((err) => {
        logger.error(err);
        reject({ message: err });
      });
  });
}

module.exports.list = (perPage, page) => {
  return new Promise((resolve, reject) => {
    Fv_Resets.findAll()
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
    Fv_Resets.findAll({
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
    Fv_Resets.findOne({
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

exports.set = (params) => {
  return new Promise((resolve, reject) => {
    const device_id = params.device_id || 0;
    const fv = params.fv || "0";
    const resets = params.resets || 0;

    Fv_Resets.findOne({
      where: { device_id: device_id, fv: fv },
    })
      .then((result) => {
        if (result) {
          Fv_Resets.update(
            { resets: resets },
            { where: { device_id: device_id, fv: fv } },
          )
            .then((result) => {
              get_total_resets(fv)
                .then((total) => {
                  resolve(total);
                })
                .catch((err) => {
                  reject({ message: err });
                });
            })
            .catch((err) => {
              reject({ message: err });
            });
        } else {
          Fv_Resets.create({ device_id: device_id, fv: fv, resets: resets })
            .then((result) => {
              get_total_resets(fv)
                .then((total) => {
                  resolve(total);
                })
                .catch((err) => {
                  reject({ message: err });
                });
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
