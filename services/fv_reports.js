const models = require("../models");
const Fv_Reports = models.Fv_Reports;
const Device = models.Device;

const { logger } = require("../logger");

function verExists(fv) {
  return Fv_Reports.count({
    where: {
      fv: fv,
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

module.exports.list = (perPage, page) => {
  return new Promise((resolve, reject) => {
    Fv_Reports.findAll({
      group: ["fv"],
    })
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
    Fv_Reports.findAll({
      where: where,
      group: ["fv"],
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
    Fv_Reports.findOne({
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

exports.create_initial_report = (params) => {
  return new Promise((resolve, reject) => {
    verExists(params.fv).then((is_exists) => {
      if (is_exists) {
        reject("exists");
      } else {
        Fv_Reports.create(params)
          .then((data) => {
            resolve(data);
          })
          .catch((err) => {
            reject({
              message: err,
            });
          });
      }
    });
  });
};

exports.setv0 = (params) => {
  return new Promise((resolve, reject) => {
    const fv = params.fv || 0;
    const type = params.type || 0;

    Fv_Reports.findOne({
      where: { fv: fv },
    })
      .then((result) => {
        if (result) {
          const update = {};
          Object.assign(update, params);
          if (type == 1) {
            update.v0_hp = result.v0_hp + 1;
          } else if (type == 2) {
            update.v0_lp = result.v0_lp + 1;
          } else if (type == 3) {
            update.v0_info = result.v0_info + 1;
          }
          Fv_Reports.update(update, { where: { fv: fv } })
            .then((result) => {
              resolve(result);
            })
            .catch((err) => {
              reject({ message: err });
            });
        } else {
          const data = {};
          Object.assign(data, params);
          if (type == 1) {
            data.v0_hp = 1;
          } else if (type == 2) {
            data.v0_lp = 1;
          } else if (type == 3) {
            data.v0_info = 1;
          }
          Fv_Reports.create(data)
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
    const fv = params.fv || 0;
    const type = params.type || 0;

    Fv_Reports.findOne({
      where: { fv: fv },
    })
      .then((result) => {
        if (result) {
          const update = {};
          Object.assign(update, params);
          if (type == 1) {
            update.vp_hp = result.vp_hp + 1;
          } else if (type == 2) {
            update.vp_lp = result.vp_lp + 1;
          } else if (type == 3) {
            update.vp_info = result.vp_info + 1;
          }
          Fv_Reports.update(update, { where: { fv: fv } })
            .then((result) => {
              resolve(result);
            })
            .catch((err) => {
              reject({ message: err });
            });
        } else {
          const data = {};
          Object.assign(data, params);
          if (type == 1) {
            data.vp_hp = 1;
          } else if (type == 2) {
            data.vp_lp = 1;
          } else if (type == 3) {
            data.vp_info = 1;
          }
          Fv_Reports.create(data)
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

exports.down_fv_device_count = (params) => {
  return new Promise((resolve, reject) => {
    const fv = params.fv || 0;
    const old_fv = params.old_fv || 0;
    /* var down_count = params.down_count || 1;

        Fv_Reports.findOne({
            where: {fv:fv},
        }).then(result => {
            if(result){
                var new_count = result.devices - down_count;
                Fv_Reports.update({devices: new_count}, {where: {fv: fv}}).then(result => {
                    resolve(result);
                }).catch(err => {
                    reject({message:err});
                });
            } else {
                resolve('noNeed');
            }
        }).catch(err => {
            reject({message:err});
        }) */
    Device.count({
      where: {
        fv: fv,
      },
      // group: ['Device.fv']
    })
      .then((count) => {
        Fv_Reports.update({ devices: count }, { where: { fv: fv } })
          .then((result) => {
            // update old firmware count
            Device.count({
              where: {
                fv: old_fv,
              },
            })
              .then((old_count) => {
                Fv_Reports.update(
                  { devices: old_count },
                  { where: { fv: old_fv } },
                )
                  .then((result) => {
                    resolve(result);
                  })
                  .catch((err) => {
                    reject({ message: err });
                  });
              })
              .catch((err) => {
                logger.error(err);
                return false;
              });
            // resolve(result);
          })
          .catch((err) => {
            reject({ message: err });
          });
      })
      .catch((err) => {
        logger.error(err);
        return false;
      });

    /* Device.findOne({
            attributes: [
                [models.sequelize.fn('count', models.sequelize.col('Device.id')), 'total_devices']
            ],
            where: {
                fv: fv
            },
            raw: true,
            group: ['Device.fv']
        }).then(total => {
            Fv_Reports.update({devices: total.total_devices}, {where: {fv: fv}}).then(result => {
                resolve(result);
            }).catch(err => {
                reject({message:err});
            });
        }).catch(err => {
            reject({
                message: err
            });
        }); */
  });
};

exports.update_all_counts = () => {
  // const DeviceModel = require('../services/device');
  const models = require("../models");
  const Device = models.Device;

  return new Promise((resolve, reject) => {
    this.list()
      .then((result) => {
        if (result) {
          result.forEach((fv) => {
            Device.count({ where: { fv: fv.fv } })
              .then((count) => {
                logger.info(`------> ${fv.fv} - ${count}`);
                Fv_Reports.update(
                  { devices: count },
                  { where: { fv: fv.fv } },
                ).catch((err) => {
                  logger.error(`------>Update Err - ${err.message}`);
                });
              })
              .catch((err) => {
                logger.error(`------>Err - ${err.message}`);
              });
          });
          resolve("ok");
        } else {
          reject({ message: "Firmwares not found" });
        }
      })
      .catch((err) => {
        reject({ message: err });
      });
  });
};
