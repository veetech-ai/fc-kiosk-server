const models = require("../models");
const Device_Metadata = models.Device_Metadata;
const sequelize = models.sequelize;

const SequelizeC = require("sequelize");
const Op = SequelizeC.Op;

module.exports.list = (perPage, page) => {
  return new Promise((resolve, reject) => {
    Device_Metadata.findAll()
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
        query.where[Op.or] = [
          { log: { [Op.like]: `%${pp.search}%` } },
          { key: { [Op.like]: `%${pp.search}%` } },
        ];
      }
    }

    Device_Metadata.findAll(query)
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
    Device_Metadata.findOne({
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
    Device_Metadata.create(params)
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
    Device_Metadata.bulkCreate(params, { returning: false })
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
    Device_Metadata.count(query)
      .then((count) => {
        resolve(count);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

exports.cutom_query = (query) => {
  return new Promise((resolve, reject) => {
    try {
      sequelize
        .query(query, {
          model: Device_Metadata,
          // raw: true,
        })
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    } catch (err) {
      reject(err);
    }
  });
};
