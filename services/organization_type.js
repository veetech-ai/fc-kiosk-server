const models = require("../models");
const OrganizationType = models.Organization_Type;

exports.listOrgTypes = async ({ limit, offset }) => {
  const query = { limit, offset };
  const orgTypes = await OrganizationType.findAll(query);
  return { data: orgTypes, count: await this.count() };
};

exports.count = async (where = false) => {
  const query = {};
  if (where) query.where = where;

  const count = await OrganizationType.count(query);
  return count;
};

exports.findOrgTypeById = async (orgTypeId) => {
  const query = {
    where: {
      id: orgTypeId,
    },
  };
  const orgType = await OrganizationType.findOne(query);
  if (!orgType) throw new Error("404");

  return orgType;
};

exports.getOrgTypeByTitle = async (orgTypeTitle) => {
  const query = {
    where: {
      title: orgTypeTitle,
    },
  };
  const orgType = OrganizationType.findOne(query);
  return orgType;
};

exports.createOrgType = async (reqBody) => {
  const exists = await this.getOrgTypeByTitle(reqBody.title);
  if (exists) throw new Error("exists");
  const orgType = await OrganizationType.create(reqBody);
  return orgType;
};
