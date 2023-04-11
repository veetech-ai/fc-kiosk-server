const helper = require("../../../helper");
const config = require("../../../../config/config");
const { logger } = require("../../../../logger");
const jwt = require("jsonwebtoken");

let tokens;
const users = {};
beforeAll(async () => {
  tokens = await helper.get_all_roles_tokens();
  tokens.adminD = await helper.get_token_for("adminD");
  tokens.testDCustomer = await helper.get_token_for("testDCustomer");
  tokens.testsuperadmin = await helper.get_token_for("testsuperadmin");

  users.testsuperadmin = jwt.verify(tokens.testsuperadmin, config.jwt.secret);
  users.testCustomer = jwt.verify(tokens.testCustomer, config.jwt.secret);
  users.testDCustomer = jwt.verify(tokens.testDCustomer, config.jwt.secret);
  users.superadmin = jwt.verify(tokens.superadmin, config.jwt.secret);
  users.admin = jwt.verify(tokens.admin, config.jwt.secret);
  users.adminD = jwt.verify(tokens.adminD, config.jwt.secret);
  users.zongCustomer = jwt.verify(tokens.zongCustomer, config.jwt.secret);
  users.testOperator = jwt.verify(tokens.testOperator, config.jwt.secret);
  users.ceo = jwt.verify(tokens.ceo, config.jwt.secret);
  users.zongCeo = jwt.verify(tokens.zongCeo, config.jwt.secret);
});

describe("Delete user by id user/delete/{userId}", () => {
  describe("Success", () => {
    it("should delete the user if super admin is deleting admin", async () => {
      try {
        const userId = users.adminD.id;
        const response = await helper.delete_request_with_authorization({
          endpoint: `user/delete/${userId}`,
          token: tokens.superadmin,
        });
        expect(response.body).toStrictEqual({
          success: true,
          data: "User deleted successfully",
        });
      } catch (error) {
        logger.error(error);
      }
    });

    it("should delete if superadmin deleting test organization user", async () => {
      try {
        const userId = users.testDCustomer.id;
        const response = await helper.delete_request_with_authorization({
          endpoint: `user/delete/${userId}`,
          token: tokens.superadmin,
        });
        expect(response.body).toStrictEqual({
          success: true,
          data: "User deleted successfully",
        });
      } catch (error) {
        logger.error(error);
      }
    });

    it("should delete if superadmin deleting any other superadmin", async () => {
      try {
        //Test Super Admin
        const userId = users.testsuperadmin.id;
        const response = await helper.delete_request_with_authorization({
          endpoint: `user/delete/${userId}`,
          token: tokens.superadmin,
        });
        expect(response.body).toStrictEqual({
          success: true,
          data: "User deleted successfully",
        });
      } catch (error) {
        logger.error(error);
      }
    });

    describe("Failure", () => {
      it("should return 401 without authorization token", async () => {
        try {
          const userId = users.admin.id;
          const response = await helper.delete_request({
            endpoint: `user/delete/${userId}`,
          });
          expect(response.body).toStrictEqual({
            success: false,
            data: "Token not provided",
          });
          expect(response.statusCode).toStrictEqual(401);
        } catch (error) {
          logger.error(error);
        }
      });

      it("should not delete the user if admin is deleting user of any organization", async () => {
        try {
          const userId = users.zongCustomer.id;
          const response = await helper.delete_request_with_authorization({
            endpoint: `user/delete/${userId}`,
            token: tokens.admin,
          });
          expect(response.body).toStrictEqual({
            success: false,
            data: "You are not allowed",
          });
        } catch (error) {
          logger.error(error);
        }
      });

      it("should not delete the user if customer is deleting ceo/user of his own organization", async () => {
        try {
          const userId = users.zongCeo.id;
          const response = await helper.delete_request_with_authorization({
            endpoint: `user/delete/${userId}`,
            token: tokens.zongCustomer,
          });
          expect(response.body).toStrictEqual({
            success: false,
            data: "You are not allowed",
          });
        } catch (error) {
          logger.error(error);
        }
      });

      it("should not delete the user if ceo is deleting user of his own organization", async () => {
        try {
          const userId = users.zongCustomer.id;
          const response = await helper.delete_request_with_authorization({
            endpoint: `user/delete/${userId}`,
            token: tokens.zongCeo,
          });
          expect(response.body).toStrictEqual({
            success: false,
            data: "You are not allowed",
          });
        } catch (error) {
          logger.error(error);
        }
      });

      it("should fail if no user found", async () => {
        try {
          const userId = 111111;
          const response = await helper.delete_request_with_authorization({
            endpoint: `user/delete/${userId}`,
            token: tokens.superadmin,
          });
          expect(response.body).toStrictEqual({
            success: false,
            data: "User not found",
          });
          expect(response.statusCode).toStrictEqual(400);
        } catch (error) {
          logger.error(error);
        }
      });

      it("should fail if super admin is trying to delete itself (super admin)", async () => {
        try {
          const userId = users.superadmin.id;
          const response = await helper.delete_request_with_authorization({
            endpoint: `user/delete/${userId}`,
            token: tokens.superadmin,
          });
          expect(response.body).toStrictEqual({
            success: false,
            data: "You can not delete your account",
          });
        } catch (error) {
          logger.error(error);
        }
      });

      it("should fail if admin is trying to delete super admin", async () => {
        try {
          const userId = users.superadmin.id;
          const response = await helper.delete_request_with_authorization({
            endpoint: `user/delete/${userId}`,
            token: tokens.admin,
          });
          expect(response.body).toStrictEqual({
            success: false,
            data: "You are not allowed",
          });
        } catch (error) {
          logger.error(error);
        }
      });

      it("should fail if customer is trying to delete user of other organization", async () => {
        try {
          const userId = users.zongCustomer.id;
          const response = await helper.delete_request_with_authorization({
            endpoint: `user/delete/${userId}`,
            token: tokens.testCustomer,
          });
          expect(response.body).toStrictEqual({
            success: false,
            data: "You are not allowed",
          });
        } catch (error) {
          logger.error(error);
        }
      });

      it("should fail if ceo is trying to delete user of other organization", async () => {
        try {
          const userId = users.zongCustomer.id;
          const response = await helper.delete_request_with_authorization({
            endpoint: `user/delete/${userId}`,
            token: tokens.ceo,
          });
          expect(response.body).toStrictEqual({
            success: false,
            data: "You are not allowed",
          });
        } catch (error) {
          logger.error(error);
        }
      });

      it("should fail if login user is trying to delete himself", async () => {
        try {
          const userId = users.zongCustomer.id;
          const response = await helper.delete_request_with_authorization({
            endpoint: `user/delete/${userId}`,
            token: tokens.zongCustomer,
          });
          expect(response.body).toStrictEqual({
            success: false,
            data: "You are not allowed",
          });
        } catch (error) {
          logger.error(error);
        }
      });

      it("should fail if user id is not provided", async () => {
        try {
          const userId = null;
          const response = await helper.delete_request_with_authorization({
            endpoint: `user/delete/${userId}`,
            token: tokens.superadmin,
          });
          expect(response.body).toStrictEqual({
            success: false,
            data: "missing/invalid 'userId'",
          });
        } catch (error) {
          logger.error(error);
        }
      });
    });
  });
});
