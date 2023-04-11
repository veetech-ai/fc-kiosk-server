const { uuid } = require("uuidv4");
const helper = require("../../../helper");
const jwt = require("jsonwebtoken");
const config = require("../../../../config/config");
const { get_where, create_user } = require("../../../../services/user");
const randtoken = require("rand-token");
const { logger } = require("../../../../logger");
const roles =
  require("../../../../common/roles_with_authorities").roleWithAuthorities;

let tokens;
const users = {};
let userId;

describe("Test the feature of unregister RFID from user", () => {
  beforeAll(async () => {
    tokens = await helper.get_all_roles_tokens();
    users.testCustomer = jwt.verify(tokens.testCustomer, config.jwt.secret);
    users.superadmin = jwt.verify(tokens.superadmin, config.jwt.secret);
    users.admin = jwt.verify(tokens.admin, config.jwt.secret);
    users.zongCustomer = jwt.verify(tokens.zongCustomer, config.jwt.secret);
    users.testOperator = jwt.verify(tokens.testOperator, config.jwt.secret);
  });

  describe('Test the API of fetching users of all organizations who have specific card serial API Uri: "/user/org/all/{cardSerial}"', () => {
    describe("Success Scenarios", () => {
      it("should fetch users from all organizations with same cardSerial", async () => {
        try {
          // We need to add 2 test users with same cardserial in 2 different organizations to get the desire results
          const newUsers = await Promise.all([
            create_user({
              name: "Test User2",
              email: `${uuid()}@cowlar.com`,
              is_admin: false,
              super_admin: false,
              orgId: 4,
              status: 1,
              password:
                "$2b$10$IItrD5CBRRjPjOwCA15lCuIa.syxKKEH9KDgYvPFpiN1aDN1ZAPNC", // 123456
              mqtt_token: randtoken.generate(10),
              role_id: roles.customer.id,
              cardSerial: "abcxyzunique123",
            }),
            create_user({
              name: "Test User",
              email: `${uuid()}@cowlar.com`,
              is_admin: false,
              super_admin: false,
              orgId: 1,
              status: 1,
              password:
                "$2b$10$IItrD5CBRRjPjOwCA15lCuIa.syxKKEH9KDgYvPFpiN1aDN1ZAPNC", // 123456
              mqtt_token: randtoken.generate(10),
              role_id: roles.customer.id,
              cardSerial: "abcxyzunique123",
            }),
          ]);
          userId = newUsers[0].dataValues.id;
          const cardSerial = "abcxyzunique123";
          const response = await helper.get_request_with_authorization({
            endpoint: `user/org/all/${cardSerial}`,
            token: tokens.admin,
          });
          expect(response.statusCode).toEqual(200);
          expect(response.body.data.length).toBeGreaterThan(1);
        } catch (error) {
          logger.error(error);
        }
      });
    });

    describe("Failure Scenarios", () => {
      it("should return 401 with wrong authorization token", async () => {
        try {
          const cardSerial = "abcxyzunique123";
          const response = await helper.get_request_with_authorization({
            endpoint: `user/org/all/${cardSerial}`,
            token: "",
          });
          expect(response.statusCode).toEqual(401);
        } catch (error) {
          logger.error(error);
        }
      });
      it("should return empty array if no user found with specific card serial", async () => {
        try {
          const cardSerial = "abcuniquenotfoundcardserial";
          const response = await helper.get_request_with_authorization({
            endpoint: `user/org/all/${cardSerial}`,
            token: tokens.admin,
          });
          expect(response.statusCode).toEqual(200);
          expect(response.body.data.length).toBe(0);
        } catch (error) {
          logger.error(error);
        }
      });
    });
  });

  describe('Test the API of removing card serial of user API Uri: "/user/{userId}/remove/cardSerial"', () => {
    describe("Success Scenarios", () => {
      it("should remove card serial of user if valid user is passed", async () => {
        try {
          const response = await helper.put_request_with_authorization({
            endpoint: `user/${userId}/remove/cardSerial`,
            token: tokens.admin,
          });
          expect(response.statusCode).toEqual(200);
          const updatedUser = await get_where({ id: userId });
          expect(updatedUser[0].cardSerial).toBeNull();
        } catch (error) {
          logger.error(error);
        }
      });
    });

    describe("Failure Scenarios", () => {
      it("should return 401 with wrong authorization token", async () => {
        try {
          const response = await helper.put_request_with_authorization({
            endpoint: `user/${userId}/remove/cardSerial`,
            token: "",
          });
          expect(response.statusCode).toEqual(401);
        } catch (error) {
          logger.error(error);
        }
      });
      it("should fail if no user found", async () => {
        try {
          const response = await helper.put_request_with_authorization({
            endpoint: "user/254689520/remove/cardSerial",
            token: tokens.admin,
          });
          expect(response.body).toStrictEqual({
            success: false,
            data: "User not found",
          });
        } catch (error) {
          logger.error(error);
        }
      });
      it("should fail if non admin user is trying to update card serial of others organization user", async () => {
        try {
          const response = await helper.put_request_with_authorization({
            endpoint: `user/${userId}/remove/cardSerial`,
            token: tokens.testOperator,
          });
          expect(response.statusCode).toEqual(403);
        } catch (error) {
          logger.error(error);
        }
      });
      it("should not remove cardSerial if user status is 3", async () => {
        try {
          const response = await helper.put_request_with_authorization({
            endpoint: "user/2032/remove/cardSerial",
            token: tokens.admin,
          });
          expect(response.statusCode).toEqual(404);
        } catch (error) {
          logger.error(error);
        }
      });
    });
  });
});
