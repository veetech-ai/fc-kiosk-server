const models = require("../models");
const ServiceError = require("../utils/serviceError");
const Organization = models.Organization;
const UsersServices = require("../services/user")

exports.list = (pp = false) => {
  return new Promise((resolve, reject) => {
    const self = this;
    const query = {};
    if (pp) {
      query.limit = pp.limit;
      query.offset = pp.offset;
    }

    Organization.findAll(query).then(async (organizations) => {
      if (pp) {
        const count = await self.count();
        resolve({ data: organizations, count: count });
      } else {
        resolve({ data: organizations, count: null });
      }
    });
  });
};
exports.count = (where = false) => {
  return new Promise((resolve, reject) => {
    const query = {};
    if (where) {
      query.where = where;
    }
    Organization.count(query)
      .then((count) => {
        resolve(count);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
exports.findById = (organizationId) => {
  return new Promise((resolve, reject) => {
    const query = {
      where: {
        id: organizationId,
      },
    };
    Organization.findOne(query)
      .then((organization) => {
        resolve(organization);
      })
      .catch(() => {
        reject(new Error("organization not found"));
      });
  });
};
exports.findByName = async (organizationName) => {
  const organization = await Organization.findOne({
    where: { name: organizationName },
  });
  if (!organization) throw new ServiceError("Organization not found", 404);
  return organization;
};

exports.isOrganizationExist = async (where) => {
  const organization = await Organization.findOne({ where })
  if (organization) return true
  return false
}

exports.createOrganization = async (body) => {
  return await Organization.create(body)
}


