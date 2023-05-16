const models = require("../models");
const Coupon_Used = models.Coupon_Used;

const { logger } = require("../logger");

function isExists(params) {
  return Coupon_Used.count({
    where: {
      user_id: params.user_id,
      coupon_id: params.coupon_id,
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
    Coupon_Used.findAll()
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

exports.findByWhere = (where) => {
  return new Promise((resolve, reject) => {
    Coupon_Used.findOne({
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

exports.create = async (params) => {
  return await Coupon_Used.create(params);
};
