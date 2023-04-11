const models = require("../models");
const Fv_Runtimes = models.Fv_Runtimes;
const FvReportsModel = require("../services/fv_reports");

const { logger } = require("../logger");

function get_total_runtimes(fv) {
  return new Promise((resolve, reject) => {
    Fv_Runtimes.findOne({
      attributes: [
        [
          models.sequelize.fn("SUM", models.sequelize.col("Fv_Runtimes.runt")),
          "total_runt",
        ],
      ],
      where: { fv: fv },
      raw: true,
      group: ["Fv_Runtimes.fv"],
    })
      .then((total) => {
        FvReportsModel.setv0({ fv: fv, runt: total.total_runt })
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
    Fv_Runtimes.findAll()
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
    Fv_Runtimes.findAll({
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
    Fv_Runtimes.findOne({
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
    const runt = params.runt || 0;

    Fv_Runtimes.findOne({
      where: { device_id: device_id, fv: fv, resets: resets },
    })
      .then((result) => {
        if (result) {
          Fv_Runtimes.update(
            { resets: resets, runt: runt },
            { where: { device_id: device_id, fv: fv, resets: resets } },
          )
            .then((result) => {
              get_total_runtimes(fv)
                .then((total) => {
                  resolve(total);
                })
                .catch((err) => {
                  logger.error(err);
                  reject({ message: err });
                });
            })
            .catch((err) => {
              logger.error(err);
              reject({ message: err });
            });
        } else {
          Fv_Runtimes.create({
            device_id: device_id,
            fv: fv,
            resets: resets,
            runt: runt,
          })
            .then((result) => {
              get_total_runtimes(fv)
                .then((total) => {
                  resolve(total);
                })
                .catch((err) => {
                  logger.error(err);
                  reject({ message: err });
                });
            })
            .catch((err) => {
              logger.error(err);
              reject({ message: err });
            });
        }
      })
      .catch((err) => {
        logger.error(err);
        reject({ message: err });
      });
  });
};
