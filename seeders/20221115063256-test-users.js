"use strict";
const randtoken = require("rand-token");
const roles =
  require("../common/roles_with_authorities").getRolesWithAuthorities()
    .roleWithAuthorities;
const config = require("../config/config");
const models = require("../models");
const Organization = models.Organization;

const { organizationsInApplication } = require("../common/organizations.data");

// ****************** NOTE: **************//
// ZONG USERS DATA IS FOR TESTING PURPOSES
module.exports = {
  up: async (queryInterface, Sequelize) => {
    if (config.env == "test") {
      const zongOrg = await Organization.findOne({
        where: { name: "Zong" },
      });
      let TestOrg = await Organization.findOne({
        where: { name: "Test" },
      });

      return queryInterface.bulkInsert(
        "Users",
        [
          {
            name: "ceo zong",
            email: "zongceo@df.com",
            orgId: zongOrg.id,
            status: 1,
            password:
              "$2b$10$IItrD5CBRRjPjOwCA15lCuIa.syxKKEH9KDgYvPFpiN1aDN1ZAPNC", // 123456
            mqtt_token: randtoken.generate(10),
            role_id: roles.ceo.id,
          },
          {
            name: "customer zong",
            email: "zong@df.com",
            orgId: zongOrg.id,
            status: 1,
            password:
              "$2b$10$IItrD5CBRRjPjOwCA15lCuIa.syxKKEH9KDgYvPFpiN1aDN1ZAPNC", // 123456
            mqtt_token: randtoken.generate(10),
            role_id: roles.customer.id,
          },
          {
            name: "operator zong",
            email: "zongop@df.com",
            orgId: zongOrg.id,
            status: 1,
            password:
              "$2b$10$IItrD5CBRRjPjOwCA15lCuIa.syxKKEH9KDgYvPFpiN1aDN1ZAPNC", // 123456
            mqtt_token: randtoken.generate(10),
            role_id: roles.operator.id,
          },
          {
            id: 2032,
            name: config.guestUser,
            email: "dummy@cowlar.com",
            is_admin: false,
            super_admin: false,
            orgId: zongOrg.id,
            status: 3,
            password:
              "$2b$10$IItrD5CBRRjPjOwCA15lCuIa.syxKKEH9KDgYvPFpiN1aDN1ZAPNC", // 123456
            email_token: null,
            mqtt_token: randtoken.generate(10),
            role_id: roles.operator.id,
            card_serial: "0000000000",
          },
          {
            name: "Test Organization CEO",
            email: "testorgceo@df.com",
            is_admin: false,
            super_admin: false,
            isapprover: false,
            isoperator: false,
            iscustomer: true,
            orgId: TestOrg.id,
            status: 1,
            password:
              "$2b$10$IItrD5CBRRjPjOwCA15lCuIa.syxKKEH9KDgYvPFpiN1aDN1ZAPNC", // 123456
            mqtt_token: randtoken.generate(10),
            role_id: roles.ceo.id,
          },
          {
            name: "Golfer",
            email: "testgolfer@df.com",
            orgId: organizationsInApplication.golfers.id,
            status: 1,
            date_of_birth: new Date(),
            gender: "male",
            handicap_index: 1,
            password:
              "$2b$10$IItrD5CBRRjPjOwCA15lCuIa.syxKKEH9KDgYvPFpiN1aDN1ZAPNC", // 123456
            mqtt_token: randtoken.generate(10),
            role_id: roles.golfer.id,
            phone: "+15052521468",
          },
        ],
        { ignoreDuplicates: true },
      );
    } else {
      return Promise.resolve();
    }
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Users", null, {});
  },
};
