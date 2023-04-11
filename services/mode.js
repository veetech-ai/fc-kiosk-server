const models = require("../models");
const Mode = models.Mode;

const { logger } = require("../logger");

function nameExists(name) {
  return Mode.count({ where: { name: name } })
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
    Mode.findAll()
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

exports.findByName = (name) => {
  return new Promise((resolve, reject) => {
    Mode.findOne({
      where: { name: name },
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject({ message: err });
      });
  });
};

exports.findByID = (id) => {
  return new Promise((resolve, reject) => {
    Mode.findOne({
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
    nameExists(params.name)
      .then((is_exists) => {
        if (is_exists) {
          reject("exists");
        } else {
          // Create new
          Mode.create(params)
            .then((data) => {
              resolve(data);
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

exports.update = (id, params) => {
  return new Promise((resolve, reject) => {
    Mode.update(params, { where: { id: id } })
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
