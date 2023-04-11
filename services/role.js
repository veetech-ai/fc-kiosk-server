const { Op } = require("sequelize");
const {
  extraRolesWithAuthorities,
} = require("../common/roles_with_authorities");
const models = require("../models");
const Role = models.Role;

exports.getRoleByTitle = async (title) => {
  return await Role.findOne({
    where: { title: title },
  });
};

exports.getAll = async (orgId = null, includeExtraRoles = false) => {
  const params = { where: {} };
  if (!includeExtraRoles) {
    const extraRolesIds = Object.values(extraRolesWithAuthorities).map(
      (r) => r.id,
    );
    params.where.id = { [Op.ne]: extraRolesIds };
  }
  if (orgId) {
    params.where = { ...params.where, super: false, admin: false };
    params.attributes = ["title"];
  }

  return await Role.findAll(params);
};
