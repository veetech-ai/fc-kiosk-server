const models = require("../models");
const ServiceError = require("../utils/serviceError");
const Organization = models.Organization;
const Course = models.Course;
const Device = models.Device;

const getOrganizationStats = async (organizations) => {
  const organizationStats = [];

  for await (const org of organizations) {
    const courseIdCount = await Course.count({ where: { orgId: org.id } });
    const deviceCount = await Device.count({ where: { owner_id: org.id } });

    const stats = {
      organizationId: org.id,
      organizationName: org.name,
      courseCount: courseIdCount,
      deviceCount: deviceCount,
    };

    organizationStats.push(stats);
  }

  return organizationStats;
};

exports.list = async (pp = false) => {
  const self = this;
  const query = {};
  if (pp) {
    query.limit = pp.limit;
    query.offset = pp.offset;
  }
  const organizations = await Organization.findAll(query);
  const organizationStats = await getOrganizationStats(organizations);
  const responseData = organizations.map((org, index) => {
    return {
      ...org.dataValues,
      courseCount: organizationStats[index].courseCount,
      deviceCount: organizationStats[index].deviceCount,
    };
  });

  if (pp) {
    const count = await self.count();
    return { data: responseData, count: count };
  }
  return { data: responseData, count: null };
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


