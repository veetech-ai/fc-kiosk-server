const models = require("../models");
const Firmware = models.Firmwares;
const Fv_Reports = require("../services/fv_reports");

const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const { logger } = require("../logger");

function verExists(ver, hw_ver, update_case_id) {
  const where = {
    ver: ver,
    hw_ver: hw_ver,
  };
  if (update_case_id) {
    where.id = { [Op.not]: update_case_id };
  }

  return Firmware.count({
    where: where,
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

module.exports.list = (with_file = false) => {
  return new Promise((resolve, reject) => {
    const select = ["hw_ver", "description", "name", "ver", "id"];
    if (with_file) {
      select.push("file");
    }

    Firmware.findAll({
      attributes: select,
    })
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

exports.findByName = (name, with_file = false) => {
  return new Promise((resolve, reject) => {
    const select = ["hw_ver", "description", "name", "ver", "id"];
    if (with_file) {
      select.push("file");
    }

    Firmware.findOne({
      attributes: select,
      where: {
        name: name,
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

exports.findByVer = (ver, with_file = false) => {
  return new Promise((resolve, reject) => {
    const select = ["hw_ver", "description", "name", "ver", "id"];
    if (with_file) {
      select.push("file");
    }

    Firmware.findOne({
      attributes: select,
      where: {
        ver: ver,
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

exports.findByID = (id, with_file = false) => {
  return new Promise((resolve, reject) => {
    const select = ["hw_ver", "description", "name", "ver", "id"];
    if (with_file) {
      select.push("file");
    }

    Firmware.findOne({
      attributes: select,
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

exports.create = (params) => {
  return new Promise((resolve, reject) => {
    verExists(params.ver, params.hw_ver)
      .then((is_exists) => {
        if (is_exists) {
          reject("exists");
        } else {
          // Create new
          Firmware.create(params)
            .then((data) => {
              resolve(data);
            })
            .catch((err) => {
              reject({
                message: err,
              });
            });
        }
      })
      .catch((err) => {
        reject({
          message: err,
        });
      });
  });
};

exports.update = (id, params) => {
  return new Promise(async (resolve, reject) => {
    const already_exists = await verExists(params.ver, params.hw_ver, id);
    if (already_exists) {
      reject("exists");
    } else {
      Firmware.update(params, {
        where: {
          id: id,
        },
      })
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject({
            message: err,
          });
        });
    }
  });
};

exports.delete = (id) => {
  return new Promise((resolve, reject) => {
    Firmware.destroy({ where: { id: id } })
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject({ message: err });
      });
  });
};

Firmware.addHook("afterCreate", "addFvReports", (firmware, options) => {
  Fv_Reports.create_initial_report({ fv: firmware.ver })
    .then((res) => {})
    .catch(() => {});
});

// function nameExists (name) {
//   return Firmware.count({
//     where: {
//       name: name
//     }
//   }).then(count => {
//     if (count > 0) {
//       return true
//     } else {
//       return false
//     }
//   }).catch(err => {
//     return false
//   })
// };

exports.verExists = verExists;
