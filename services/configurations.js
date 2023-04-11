const models = require("../models");
const Configurations = models.Configurations;
const { documentation } = require("../common/default_Configuration");
exports.get = () => {
  return new Promise((resolve, reject) => {
    Configurations.findOne()
      .then((result) => {
        if (result.config.documentation == undefined) {
          result.config = { ...result.config, documentation };
        }
        resolve(result);
      })
      .catch((err) => {
        reject({ message: err });
      });
  });
};

exports.save = (params) => {
  return new Promise((resolve, reject) => {
    Configurations.findOne()
      .then((result) => {
        if (result) {
          Configurations.update(params, { where: { id: result.id } })
            .then((result) => {
              resolve(result);
            })
            .catch((err) => {
              reject({ message: err });
            });
        } else {
          Configurations.create(params)
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
