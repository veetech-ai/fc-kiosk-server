"use strict";
const randtoken = require("rand-token");
const roles =
  require("../common/roles_with_authorities").getRolesWithAuthorities()
    .roleWithAuthorities;
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
      id: 1,
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
          id: 2,
          name: "Admin",
          email: "admin.df@cowlar.com",
          is_admin: true,
          super_admin: false,
          status: 1,
          password:
            "$2b$10$IItrD5CBRRjPjOwCA15lCuIa.syxKKEH9KDgYvPFpiN1aDN1ZAPNC", // 123456
          mqtt_token: randtoken.generate(10),
          role_id: roles.admin.id,
        },
        {
          id: 3,
          name: "Device Account",
          email: "device.df@cowlar.com",
          is_admin: true,
          super_admin: false,
          status: 1,
          password:
            "$2b$10$IItrD5CBRRjPjOwCA15lCuIa.syxKKEH9KDgYvPFpiN1aDN1ZAPNC", // 123456
          mqtt_token: randtoken.generate(10),
          role_id: roles.superAdmin.id,
        },
        {
          id: 4,
          name: "Super Admin",
          email: "superadmin.df@cowlar.com",
          is_admin: true,
          super_admin: true,
          status: 1,
          password:
            "$2b$10$IItrD5CBRRjPjOwCA15lCuIa.syxKKEH9KDgYvPFpiN1aDN1ZAPNC", // 123456
          mqtt_token: randtoken.generate(10),
          role_id: roles.superAdmin.id,
        },
        {
          id: 5,
          name: "Test Super Admin",
          email: "testsuperadmin.df@cowlar.com",
          is_admin: true,
          super_admin: true,
          status: 1,
          password:
            "$2b$10$IItrD5CBRRjPjOwCA15lCuIa.syxKKEH9KDgYvPFpiN1aDN1ZAPNC", // 123456
          mqtt_token: randtoken.generate(10),
          role_id: roles.superAdmin.id,
        },
        {
          id: 6,
          name: "Test Organization Operator account",
          email: "testorgoperator.df@cowlar.com",
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
          id: 7,
          name: "operator account",
          email: "testoperator.df@cowlar.com",
          is_admin: false,
          super_admin: false,
          orgId: TestOrg.id,
          status: 3,
          password:
            "$2b$10$IItrD5CBRRjPjOwCA15lCuIa.syxKKEH9KDgYvPFpiN1aDN1ZAPNC", // 123456
          mqtt_token: randtoken.generate(10),
          role_id: roles.operator.id,
          card_serial: 123654,
        },
        {
          id: 8,
          name: "Test Organization Device Account",
          email: "testorgdevice.df@cowlar.com",
          is_admin: false,
          super_admin: false,
          orgId: TestOrg.id,
          status: 1,
          password:
            "$2b$10$IItrD5CBRRjPjOwCA15lCuIa.syxKKEH9KDgYvPFpiN1aDN1ZAPNC", // 123456
          mqtt_token: randtoken.generate(10),
          role_id: roles.device.id,
        },
        {
          id: 9,
          name: "Test Organization Customer account - D",
          email: config.testDAccountEmail,
          is_admin: false,
          super_admin: false,
          orgId: TestOrg.id,
          status: 1,
          password:
            "$2b$10$IItrD5CBRRjPjOwCA15lCuIa.syxKKEH9KDgYvPFpiN1aDN1ZAPNC", // 123456
          mqtt_token: randtoken.generate(10),
          role_id: roles.customer.id,
        },
        {
          id: 10,
          name: "Admin D",
          email: "admind.df@cowlar.com",
          is_admin: true,
          super_admin: false,
          status: 1,
          password:
            "$2b$10$IItrD5CBRRjPjOwCA15lCuIa.syxKKEH9KDgYvPFpiN1aDN1ZAPNC", // 123456
          mqtt_token: randtoken.generate(10),
          role_id: roles.admin.id,
        },
        {
          id: 11,
          name: "Test Organization Manager account",
          email: "testorgmanager.df@cowlar.com",
          orgId: TestOrg.id,
          status: 1,
          password:
            "$2b$10$IItrD5CBRRjPjOwCA15lCuIa.syxKKEH9KDgYvPFpiN1aDN1ZAPNC", // 123456
          mqtt_token: randtoken.generate(10),
          role_id: roles.manager.id,
          report_to: testCustomer.id,
        },
      ],
      { ignoreDuplicates: true, updateOnDuplicate: ["role_id", "email"] },
    );
    return result;
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Users", null, {});
  },
};
