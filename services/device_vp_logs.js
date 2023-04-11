const models = require("../models");
const Device_Vp_Logs = models.Device_Vp_Logs;

const Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports.list = (perPage, page) => {
  return new Promise((resolve, reject) => {
    Device_Vp_Logs.findAll()
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
module.exports.list_by_where = (where, pp = false) => {
  return new Promise((resolve, reject) => {
    const self = this;
    const query = {
      where: where,
      order: [["id", "DESC"]],
    };

    if (pp) {
      query.limit = pp.limit;
      query.offset = pp.offset;
      if (pp.search && pp.search != "") {
        query.where.log = { [Op.like]: `%${pp.search}%` };
      }
    }
    Device_Vp_Logs.findAll(query)
      .then(async (result) => {
        if (pp) {
          const count = await self.count(where);
          resolve({ data: result, count: count });
        } else {
          resolve(result);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};
exports.find_by_where = (where) => {
  return new Promise((resolve, reject) => {
    Device_Vp_Logs.findOne({
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

exports.create = (params) => {
  return new Promise((resolve, reject) => {
    Device_Vp_Logs.create(params)
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

exports.bulk_create = (params) => {
  return new Promise((resolve, reject) => {
    Device_Vp_Logs.bulkCreate(params, { returning: false })
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

exports.count = (where = false) => {
  return new Promise((resolve, reject) => {
    const query = {};
    if (where) {
      query.where = where;
    }
    Device_Vp_Logs.count(query)
      .then((count) => {
        resolve(count);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
