"use strict";
const randtoken = require("rand-token");
const roles =
  require("../common/roles_with_authorities").getRolesWithAuthorities()
    .roleWithAuthorities;
const { organizationsInApplication } = require("../common/organizations.data");

const config = require("../config/config");
const models = require("../models");
const Organization = models.Organization;

// ****************** NOTE: **************//
// ZONG USERS DATA IS FOR TESTING PURPOSES
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const TestOrg = await Organization.findOne({
      where: { name: "Test" },
    });
    const testCustomer = {
      name: "Test Organization Customer account",
      email: config.testAccountEmail,
      is_admin: false,
      super_admin: false,
      orgId: TestOrg.id,
      status: 1,
      password: "$2b$10$IItrD5CBRRjPjOwCA15lCuIa.syxKKEH9KDgYvPFpiN1aDN1ZAPNC", // 123456
      mqtt_token: randtoken.generate(10),
      role_id: roles.customer.id,
    };

    const result = await queryInterface.bulkInsert(
      "Users",
      [
        testCustomer,
        {
          name: "Admin",
          email: "admin@df.com",
          is_admin: true,
          super_admin: false,
          status: 1,
          password:
            "$2b$10$IItrD5CBRRjPjOwCA15lCuIa.syxKKEH9KDgYvPFpiN1aDN1ZAPNC", // 123456
          mqtt_token: randtoken.generate(10),
          role_id: roles.admin.id,
        },
        {
          name: "Device Account",
          email: "device@df.com",
          is_admin: true,
          super_admin: false,
          status: 1,
          password:
            "$2b$10$IItrD5CBRRjPjOwCA15lCuIa.syxKKEH9KDgYvPFpiN1aDN1ZAPNC", // 123456
          mqtt_token: randtoken.generate(10),
          role_id: roles.superAdmin.id,
        },
        {
          name: "Super Admin",
          email: "superadmin@df.com",
          is_admin: true,
          super_admin: true,
          status: 1,
          password:
            "$2b$10$IItrD5CBRRjPjOwCA15lCuIa.syxKKEH9KDgYvPFpiN1aDN1ZAPNC", // 123456
          mqtt_token: randtoken.generate(10),
          role_id: roles.superAdmin.id,
        },
        {
          name: "Test Super Admin",
          email: "testsuperadmin@df.com",
          is_admin: true,
          super_admin: true,
          status: 1,
          password:
            "$2b$10$IItrD5CBRRjPjOwCA15lCuIa.syxKKEH9KDgYvPFpiN1aDN1ZAPNC", // 123456
          mqtt_token: randtoken.generate(10),
          role_id: roles.superAdmin.id,
        },
        {
          name: "Test Organization Operator account",
          email: "testorgoperator@df.com",
          is_admin: false,
          super_admin: false,
          orgId: TestOrg.id,
          status: 1,
          password:
            "$2b$10$IItrD5CBRRjPjOwCA15lCuIa.syxKKEH9KDgYvPFpiN1aDN1ZAPNC", // 123456
          mqtt_token: randtoken.generate(10),
          role_id: roles.operator.id,
          card_serial: 123654,
        },
        {
          name: "Test Organization Manager account",
          email: "testorgmanager@df.com",
          orgId: TestOrg.id,
          status: 1,
          password:
            "$2b$10$IItrD5CBRRjPjOwCA15lCuIa.syxKKEH9KDgYvPFpiN1aDN1ZAPNC", // 123456
          mqtt_token: randtoken.generate(10),
          role_id: roles.manager.id,
          report_to: testCustomer.id,
        }
      ],
      { ignoreDuplicates: true, updateOnDuplicate: ["role_id", "email"] },
    );
    return result;
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Users", null, {});
  },
};
