const models = require("../models");
const Coupon = models.Coupon;

const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const { logger } = require("../logger");

const ServiceError = require("../utils/serviceError");

const organizationServices = require("./organization");
const courseServices = require("./kiosk/course");
const couponUsedServices = require("./coupon_used");

module.exports.list_available = (perPage, page) => {
  return new Promise((resolve, reject) => {
    Coupon.findAll({
      where: {
        status: 1,
        expiry: { [Op.gt]: new Date() },
        max_use_limit: { [Op.gt]: { [Sequelize.Op.col]: "Coupon.used_by" } },
      },
    })
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

exports.findByID = (id) => {
  return new Promise((resolve, reject) => {
    Coupon.findOne({
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

exports.validate = async ({ code, gcId, orgId }) => {
  const where = {
    code: code,
    status: 1,
    expiry: { [Op.gt]: new Date() },
    maxUseLimit: { [Op.gt]: { [Sequelize.Op.col]: "Coupon.usedBy" } },
    [Op.or]: [],
  };

  if (gcId) where[Op.or].push({ gcId });
  if (orgId) where[Op.or].push({ orgId });

  const coupon = await Coupon.findOne({
    where,
  });

  if (!coupon) {
    throw new ServiceError("Invalid Coupon or coupon may expire", 404);
  }

  return coupon;
};

exports.create = async (params) => {
  const coupon = await Coupon.findOne({
    where: {
      code: params.code,
    },
  });
  if (coupon) throw new ServiceError("Coupon already exists", 409);
  return await Coupon.create(params);
};

exports.updateCouponById = async (id, params) => {
  const updateResponseArray = await Coupon.update(params, {
    where: {
      id,
    },
  });
  const noOfAffectedRows = updateResponseArray[0];
  return noOfAffectedRows;
};

exports.use_increment = (id) => {
  return new Promise((resolve, reject) => {
    Coupon.findOne({ where: { id: id } })
      .then((coupon) => {
        if (coupon) {
          const new_used_by = parseInt(coupon.used_by) + 1;
          Coupon.update(
            { used_by: new_used_by },
            {
              where: {
                id: id,
              },
            },
          )
            .then((result) => {
              resolve(result);
            })
            .catch((err) => {
              logger.error("c not updated");
              logger.error(err);
              reject({ message: err });
            });
        } else {
          logger.error("coupon not found");
          reject({ message: "coupon not found" });
        }
      })
      .catch((err) => {
        reject({ message: err });
      });
  });
};

exports.getValidParent = async ({ orgId, gcId, loggedInUserOrgId }) => {
  let parent = null;
  let toReturn;
  if (!orgId && !gcId && !loggedInUserOrgId)
    throw new ServiceError("Parent resource id is required", 400);
  if (orgId && gcId)
    throw new ServiceError("Coupon can have only one parent", 400);
  if (gcId) {
    const where = {
      id: gcId,
    };
    if (loggedInUserOrgId) where.orgId = loggedInUserOrgId;
    parent = await courseServices.getOne(where);
    toReturn = {
      gcId,
    };
  } else if (orgId || loggedInUserOrgId) {
    let organizationIdToFind = orgId;

    if (loggedInUserOrgId && !organizationIdToFind) {
      organizationIdToFind = loggedInUserOrgId;
    }

    if (loggedInUserOrgId && organizationIdToFind !== loggedInUserOrgId) {
      throw new ServiceError("You are not allowed", 403);
    }

    parent = await organizationServices.findById(organizationIdToFind);
    toReturn = {
      orgId: organizationIdToFind,
    };
  }

  if (!parent) throw new ServiceError("Parent does not exist", 404);

  return toReturn;
};

exports.deleteAll = async (where) => {
  return await Coupon.destroy({ where });
};

exports.redeemCoupon = async (coupon, deviceId) => {
  const body = {
    deviceId,
    couponId: coupon.id,
  };

  if (coupon.gcId) body.gcId = coupon.gcId;
  await couponUsedServices.create(body);

  await Coupon.update(
    { usedBy: coupon.usedBy + 1 },
    {
      where: {
        id: coupon.id,
      },
    },
  );
};

exports.findAllCoupons = async (where) => {
  return await Coupon.findAll({ where });
};

exports.deleteCouponsWhere = async (where) => {
  const clonedWhere = { ...where };
  const noOfAffectedRows = await Coupon.destroy({ where: clonedWhere });
  if (!noOfAffectedRows) {
    throw new ServiceError("Coupon not found", 404);
  }
  return noOfAffectedRows;
};

exports.findOneCoupon = async (where, loggedInUserOrgId) => {
  const clonedWhere = { ...where };
  const coupon = await Coupon.findOne({
    where: clonedWhere,
    include: [
      {
        as: "Course",
        model: models.Course,
      },
    ],
  });

  if (!coupon) throw new ServiceError("Coupon not found", 404);
  const linkedCourse = coupon.Course;
  if (linkedCourse) {
    // Course specific coupon
    if (loggedInUserOrgId && linkedCourse.orgId !== loggedInUserOrgId) {
      throw new ServiceError("Coupon not found", 404);
    }
  } else {
    // Organization specific coupon
    if (loggedInUserOrgId && coupon.orgId !== loggedInUserOrgId) {
      throw new ServiceError("Coupon not found", 404);
    }
  }

  return coupon;
};

exports.checkCouponType = async (where, loggedInUserOrgId) => {
  const coupon = await this.findOneCoupon(where, loggedInUserOrgId);
  let toReturn = {};
  if (coupon.gcId) {
    toReturn.gcId = coupon.gcId;
  } else if (coupon.orgId) {
    toReturn.orgId = coupon.orgId;
  }
  return toReturn;
};
