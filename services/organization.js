const models = require("../models");
const Organization = models.Organization;

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
exports.findByName = (organizationName) => {
  return new Promise((resolve, reject) => {
    const query = {
      where: {
        name: organizationName,
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
