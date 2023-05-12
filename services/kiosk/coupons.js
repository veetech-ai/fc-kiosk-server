const models = require("../../models");
const Coupon = models.Coupon;

const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const ServiceError = require("../../utils/serviceError");

const { logger } = require("../../logger");
const organizationServices = require("../organization");
const courseServices = require("../../services/kiosk/course");


function idExists(code) {
    return Coupon.count({
        where: {
            code: code,
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

module.exports.list = (perPage, page) => {
    return new Promise((resolve, reject) => {
        Coupon.findAll({
            // where: {status:1},
        })
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
        Coupon.findOne({
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

exports.validate = (code) => {
    return new Promise((resolve, reject) => {
        Coupon.findOne({
            where: {
                code: code,
                status: 1,
                expiry: { [Op.gt]: new Date() },
                max_use_limit: { [Op.gt]: { [Sequelize.Op.col]: "Coupon.used_by" } },
            },
            include: [
                {
                    as: "Coupon_Used",
                    model: models.Coupon_Used,
                    attributes: ["user_id"],
                    require: false,
                },
            ],
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
    const coupon = await Coupon.findOne({ where: {
        code: params.code
    } })
    if (coupon) throw new ServiceError("Coupon already exists", 409);
    return await Coupon.create(params)
};

exports.update = (id, params) => {
    return new Promise((resolve, reject) => {
        if (params.code) {
            delete params.code;
        }
        Coupon.update(params, {
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
    });
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
    if (!orgId && !gcId && !loggedInUserOrgId) throw new ServiceError("Parent resource id is required", 400)
    if (orgId && gcId) throw new ServiceError("Coupon can have only one parent", 400)
    if (gcId) {
        const where = {
            id: gcId
        }
        if (loggedInUserOrgId) where.orgId = loggedInUserOrgId
        parent = await courseServices.getOne(where)
        toReturn = {
            gcId 
        }
    } else if (orgId || loggedInUserOrgId) {
        let organizationIdToFind = orgId;
        if (loggedInUserOrgId && !organizationIdToFind) organizationIdToFind = loggedInUserOrgId

        if (loggedInUserOrgId && organizationIdToFind !== loggedInUserOrgId) throw new ServiceError("You are not allowed", 403);
        parent = await organizationServices.findById(organizationIdToFind)
        toReturn = {
            orgId: organizationIdToFind
        }
    }

    if (!parent) throw new ServiceError("Parent does not exist", 404)

    return toReturn;
}
