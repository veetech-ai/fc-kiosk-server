// External Module Imports
const Sequelize = require("sequelize");

// Logger Imports
const { logger } = require("../logger");

// Models Imports
const models = require("../models");
const User = models.User;
const Role = models.Role;

// Configuration Imports
const config = require("../config/config");

// Common Imports
const helper = require("../common/helper");
const email = require("../common/email");
const {
  reportToUserDictionary,
  roleWithAuthorities,
} = require("../common/roles_with_authorities");

// Services Imports
const OrganizationModel = require("./organization");
const RoleModel = require("./role");
const organizationServices = require("../services/organization");
const { organizationsInApplication } = require("../common/organizations.data");

const PNSubscription = models.Push_Notifications_Subscriptions;
const UserSettings = models.User_Settings;
const UserAddresses = models.User_Addresses;

const Op = Sequelize.Op;
exports.Op = Op;

const UsersStatus = {
  inactive: 0,
  active: 1,
  deleted: 2,
  dummy: 3,
};

exports.UsersStatus = UsersStatus;

const emailExists = async (email) => {
  return await User.count({ where: { email: email } });
};

const PhoneExists = async (phone) => {
  return await User.count({ where: { phone: phone } });
};

exports.list = async (paginationParams = false) => {
  const query = {
    include: [
      {
        as: "Organization",
        model: models.Organization,
        attributes: ["name"],
      },
      {
        as: "Role",
        model: models.Role,
        attributes: ["title"],
      },
    ],
    where: {
      status: {
        [Op.or]: [0, 1],
      },
    },
  };

  if (paginationParams) {
    query.limit = paginationParams.limit;
    query.offset = paginationParams.offset;
  }

  const users = await User.findAll(query);

  if (paginationParams) {
    const count = await this.count(query.where);
    return { data: users, count: count };
  } else return users;
};

exports.findByOrgId = async (query) => {
  const users = await User.findAll(query);
  if (query) {
    const count = await this.count(query.where);
    return { data: users, count: count };
  } else return users;
};

exports.findUserIdsByOrgId = async (orgId) => {
  const ids = await User.findAll({
    attributes: ["id"],
    where: { orgId: orgId },
  });

  const count = ids.length;
  return { ids: ids, count: count };
};

exports.getAllSuperAdminIds = async () => {
  return await User.findAll({ attributes: ["id"], where: { super_admin: 1 } });
};

exports.list_end_users = async () => {
  return await User.findAll({
    attributes: ["id", "name", "email"],
    where: { is_admin: 0, super_admin: 0, status: 1 },
  });
};

exports.list_selective_users = async (perPage, page, ids) => {
  return await User.findAll({
    attributes: ["id", "name", "email"],
    where: {
      id: {
        [Sequelize.Op.in]: ids,
      },
    },
  });
};

exports.create_user = async (params) => {
  const isGolferWithPhoneLogin =
    params?.role_id === roleWithAuthorities.golfer.id;

  if (isGolferWithPhoneLogin) {
    const isPhone = await PhoneExists(params.phone);

    if (!isPhone) {
      const paramsWithRole = {
        ...params,
        role_id: params.role_id,
        orgId: organizationsInApplication.golfers.id,
      };
      await User.create(paramsWithRole);
    }

    let user = await this.getAllDetailByWhere({
      phone: params.phone,
    });

    return user;
  } else {
    const isExists = await emailExists(params.email);
    if (isExists) {
      throw new Error("emailExists");
    }

    // Create new user
    return await User.create(params);
  }
};

exports.update_user = async (id, user) => {
  const result = await User.update(user, {
    where: {
      id: id,
    },
  });

  if (!result[0]) throw new Error("There is a problem. Please try later.");

  return result;
};

exports.update_where = async (params, where) => {
  const user = await User.update(params, { where: where });
  if (user) return user[0];
  else throw new Error("There is a problem. Please try later.");
};

exports.find_by_where = async (where) => {
  return await User.findOne({
    where: where,
    include: [
      {
        as: "Role",
        model: models.Role,
        attributes: ["title"],
      },
    ],
  });
};

exports.getAllDetailByWhere = async (where) => {
  const user = await User.findOne({
    include: [
      {
        as: "Role",
        model: models.Role,
      },
    ],
    attributes: [
      "id",
      "name",
      "first_name",
      "last_name",
      "email",
      "phone",
      "password",
      "password_token",
      "email_token",
      "is_admin",
      "status",
      "profile_image",
      "advance_user",
      "mqtt_token",
      "super_admin",
      "pn_status",
      "phone_code",
      "phone_verified",
      "fb_id",
      "g_id",
      "tw_id",
      "email_code",
      "orgId",
      "cardSerial",
      "roleId",
    ],
    where,
  });

  if (user) return user;
  else throw new Error("invalidEmail");
};

exports.findByEmail = async (email) => {
  const user = await User.findOne({
    include: [
      {
        as: "Role",
        model: models.Role,
      },
    ],
    where: { email: email },
  });

  if (user) return user;
  else throw new Error("invalidEmail");
};

exports.findById = async (id, organizationId = null) => {
  const whereStatement = { id };
  if (organizationId) whereStatement.orgId = organizationId;

  const user = await User.findOne({
    where: whereStatement,
    include: [
      {
        as: "User_Settings",
        model: models.User_Settings,
        attributes: ["config"],
        required: false,
      },
      {
        as: "Organization",
        model: models.Organization,
        attributes: ["name"],
      },
      {
        as: "Role",
        model: models.Role,
      },
    ],
  });

  if (user) return user;
  else throw new Error("User not found");
};

exports.findAllUsersByCardSerial = async (
  cardSerial,
  organizationId = null,
) => {
  const whereStatement = { cardSerial };
  if (organizationId) whereStatement.orgId = organizationId;

  return await User.findAll({
    where: whereStatement,
    attributes: {
      exclude: [
        "password",
        "password_token",
        "email_token",
        "createdAt",
        "updatedAt",
      ],
    },
    include: [
      {
        as: "User_Settings",
        model: models.User_Settings,
        attributes: ["config"],
        required: false,
      },
      {
        as: "Organization",
        model: models.Organization,
        attributes: ["name"],
      },
      {
        as: "Role",
        model: models.Role,
      },
    ],
  });
};

exports.findByCardSerial = async (cardSerial, organizationId = null) => {
  const whereStatement = { cardSerial };
  if (organizationId) whereStatement.orgId = organizationId;

  return await User.findOne({
    where: whereStatement,
    attributes: {
      exclude: [
        "password",
        "password_token",
        "email_token",
        "createdAt",
        "updatedAt",
      ],
    },
    include: [
      {
        as: "User_Settings",
        model: models.User_Settings,
        attributes: ["config"],
        required: false,
      },
      {
        as: "Organization",
        model: models.Organization,
        attributes: ["name"],
      },
      {
        as: "Role",
        model: models.Role,
      },
    ],
  });
};
/*
no one can delete super admin
customer can't delete admin and super_admin
customer can delete the user belong the the same organization he has
*/
exports.disable_by_id = async (idOfUserToBeDisabled, loggedInUser) => {
  const userToBeDisabled = await this.findById(idOfUserToBeDisabled);
  const isTestOrgUser =
    userToBeDisabled.Organization &&
    userToBeDisabled.Organization.name === config.testOrganization;

  const isUserValidToBeDisabled =
    ((!helper.hasProvidedRoleRights(loggedInUser.role, ["manageUsers"])
      .success &&
      !helper.hasProvidedRoleRights(userToBeDisabled.Role, ["super"])
        .success) ||
      (helper.hasProvidedRoleRights(loggedInUser.role, ["manageUsers"])
        .success &&
        loggedInUser.orgId === userToBeDisabled.orgId)) &&
    loggedInUser.id !== userToBeDisabled.id &&
    userToBeDisabled.status !== UsersStatus.dummy;

  if (isTestOrgUser) {
    throw new Error("Can not remove test organization user");
  } else if (isUserValidToBeDisabled) {
    const updatedUser = await User.update(
      { status: 2 },
      { where: { id: userToBeDisabled.id } },
    );

    return updatedUser;
  } else {
    throw new Error("Operation can not be performed");
  }
};

exports.remove_by_id = async (id, loggedInUser) => {
  const user = await this.findById(id);

  if (user.Organization.name === config.testOrganization) {
    throw new Error("testOrganizationUser");
  } else if (user.super_admin) {
    throw new Error("you can't delete super admin");
  } else if (loggedInUser.id === user.id) {
    throw new Error("Action can not be performed, you can't delete yourself.");
  } else {
    throw new Error("Operation can not be performed");
  }
};

exports.enable_by_id = async (idOfUserToBeEnabled, loggedInUser) => {
  const userToBeEnabled = await this.findById(idOfUserToBeEnabled);
  const isTestOrgUser =
    userToBeEnabled.Organization &&
    userToBeEnabled.Organization.name === config.testOrganization;

  const isUserValidToBeEnabled =
    ((!helper.hasProvidedRoleRights(loggedInUser.role, ["manageUsers"])
      .success &&
      !helper.hasProvidedRoleRights(userToBeEnabled.Role, ["super"]).success) ||
      (helper.hasProvidedRoleRights(loggedInUser.role, ["manageUsers"])
        .success &&
        loggedInUser.orgId === userToBeEnabled.orgId)) &&
    loggedInUser.id !== userToBeEnabled.id &&
    userToBeEnabled.status !== UsersStatus.dummy;

  if (isTestOrgUser) {
    throw new Error("Can not enable test organization user");
  } else if (isUserValidToBeEnabled) {
    const updatedUser = await User.update(
      { status: 1 },
      { where: { id: userToBeEnabled.id } },
    );

    return updatedUser;
  } else {
    throw new Error("Operation can not be performed");
  }
};

exports.change_password = async (id, password, type) => {
  const where = type == "token" ? { password_token: id } : { id: id };

  const user = await User.update(
    { password: password, password_token: null },
    { where: where },
  );

  if (user) return user;
  else throw new Error("There is a problem. Please try later.");
};

exports.set_password_token = async (id, token) => {
  const user = await User.update(
    { password_token: token },
    { where: { id: id } },
  );

  if (user) return user;
  else throw new Error("There is a problem. Please try later.");
};

exports.is_token_exists = async (token, type) => {
  const where =
    type == "email_token" ? { email_token: token } : { password_token: token };

  try {
    return (
      (await User.count({
        where: where,
        attributes: ["password_token", "email_token"],
      })) > 0
    );
  } catch (error) {
    logger.error(error);
    return false;
  }
};

exports.verify_email_token = async (token) => {
  const user = await User.update(
    { status: 1, email_token: null, email_code: null },
    {
      where: { email_token: token },
      include: [{ as: "Role", model: models.Role }],
    },
  );

  if (user) return user;
  else throw new Error("There is a problem. Please try later.");
};

exports.count = async (where = null) => {
  const query = {};
  if (where) {
    query.where = where;
  }

  return await User.count(query);
};

exports.get_where = async (where) => {
  const user = await User.findAll({ where: where });

  if (user) return user;
  else throw new Error("There is a problem. Please try later.");
};

function checkIsValidReportToUser(reportToUserRole, userRole) {
  return reportToUserDictionary[userRole].includes(reportToUserRole);
}

exports.createAndInviteUser = async (params) => {
  let orgId = params.orgId;
  const isAdmin = params.role === "admin" || params.role === "super admin";
  if (isAdmin && orgId)
    throw new Error(`${params.role} can not be in any organization`);

  if (!isAdmin) {
    const org = await OrganizationModel.findById(params.orgId);
    if (!org) throw new Error("Organization not found");
    else if (org.name === config.testOrganization)
      throw new Error("test organization");
  }
  if (params?.reportTo) {
    const reportToUser = await this.findById(params?.reportTo);
    if (!reportToUser || reportToUser.orgId != orgId)
      throw new Error("Report to user id is incorrect");
    if (!checkIsValidReportToUser(reportToUser?.Role?.title, params.role))
      throw new Error("Invalid role of report to user");
  }

  const token = helper.generate_verify_token();
  params.email_token = params.invitation_token ? null : token;
  params.status = 0;
  params.mqtt_token = helper.generate_token(10);

  if (config.env === "test") {
    params.name = "Guest";
    params.password = "";
  }
  params.password = "";
  const roleTitle = params.role;
  const role = await RoleModel.getRoleByTitle(roleTitle);
  if (!role) throw new Error("Role not found");

  params.roleId = role.id;

  const user = await this.find_by_where({ email: params.email });
  if (user && user.email_token) throw new Error("Invitation already sent");

  const createdUser = await this.create_user(params);
  const e_mail = createdUser.email;
  const name = createdUser.name;
  const userId = createdUser.id;

  orgId = createdUser.orgId;

  const mail = await email.send_complete_registration_email(
    createdUser,
    params.role,
  );

  return {
    message: "User Invited successfully",
    e_mail,
    orgId,
    mail,
    name,
    userId,
  };
};

exports.findByIds = async (operatorIds) => {
  const where = {
    id: operatorIds,
  };

  return await User.findAll({
    attributes: ["id"],
    where: where,
  });
};

exports.delete = async (userId, loggedInUser) => {
  const userToBeDeleted = await this.findById(userId);

  const isUserValidToBeDeleted = loggedInUser.id !== userToBeDeleted.id;
  if (!isUserValidToBeDeleted)
    throw new Error("You can not delete your account");

  await User.destroy({
    where: {
      id: userId,
    },
  });

  await PNSubscription.destroy({
    where: { user_id: userId },
  });

  await UserSettings.destroy({
    where: { user_id: userId },
  });

  await UserAddresses.destroy({
    where: { user_id: userId },
  });

  return "User deleted successfully";
};
