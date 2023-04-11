const helper = require("../../../helper");
const jwt = require("jsonwebtoken");
const config = require("../../../../config/config");
const { get_where } = require("../../../../services/user");
const { logger } = require("../../../../logger");

let tokens;
const users = {};
beforeAll(async () => {
  tokens = await helper.get_all_roles_tokens();
  users.testCustomer = jwt.verify(tokens.testCustomer, config.jwt.secret);
  users.superadmin = jwt.verify(tokens.superadmin, config.jwt.secret);
  users.admin = jwt.verify(tokens.admin, config.jwt.secret);
  users.zongCustomer = jwt.verify(tokens.zongCustomer, config.jwt.secret);
  users.testOperator = jwt.verify(tokens.testOperator, config.jwt.secret);
  users.ceo = jwt.verify(tokens.ceo, config.jwt.secret);
  users.zongCeo = jwt.verify(tokens.zongCeo, config.jwt.secret);
});

afterAll(async () => {
  await helper.put_request_with_authorization({
    endpoint: `user/enable/${users.admin.id}`,
    token: tokens.superadmin,
  });
  await helper.put_request_with_authorization({
    endpoint: `user/enable/${users.testCustomer.id}`,
    token: tokens.superadmin,
  });
  await helper.put_request_with_authorization({
    endpoint: `user/enable/${users.zongCustomer.id}`,
    token: tokens.superadmin,
  });
  await helper.put_request_with_authorization({
    endpoint: `user/enable/${users.ceo.id}`,
    token: tokens.superadmin,
  });
  await helper.put_request_with_authorization({
    endpoint: `user/enable/${users.zongCeo.id}`,
    token: tokens.superadmin,
  });
});

describe("Disable user by id user/disable/{userId}", () => {
  describe("Success", () => {
    it("should disable the user if super admin is disabling admin", async () => {
      try {
        const userId = users.admin.id;
        const response = await helper.put_request_with_authorization({
          endpoint: `user/disable/${userId}`,
          token: tokens.superadmin,
        });
        expect(response.body).toStrictEqual({
          success: true,
          data: "User deleted successfully",
        });
        const updatedUser = await get_where({ id: userId });
        expect(updatedUser[0].status).toStrictEqual(2);
      } catch (error) {
        logger.error(error);
      }
    });
    it("should disable the user if admin is disabling user of any organization", async () => {
      try {
        const userId = users.zongCustomer.id;
        const response = await helper.put_request_with_authorization({
          endpoint: `user/disable/${userId}`,
          token: tokens.admin,
        });
        expect(response.body).toStrictEqual({
          success: true,
          data: "User deleted successfully",
        });
        const updatedUser = await get_where({ id: userId });
        expect(updatedUser[0].status).toStrictEqual(2);
      } catch (error) {
        logger.error(error);
      }
    });
    it("should disable the user if customer is disabling user of his own organization", async () => {
      try {
        const userId = users.zongCeo.id;
        const response = await helper.put_request_with_authorization({
          endpoint: `user/disable/${userId}`,
          token: tokens.zongCustomer,
        });
        expect(response.body).toStrictEqual({
          success: true,
          data: "User deleted successfully",
        });
      } catch (error) {
        logger.error(error);
      }
    });
    it("should disable the user if ceo is disabling user of his own organization", async () => {
      try {
        const userId = users.zongCustomer.id;
        const response = await helper.put_request_with_authorization({
          endpoint: `user/disable/${userId}`,
          token: tokens.zongCeo,
        });
        expect(response.body).toStrictEqual({
          success: true,
          data: "User deleted successfully",
        });
      } catch (error) {
        logger.error(error);
      }
    });
  });

  describe("Failure", () => {
    it("should return 401 without authorization token", async () => {
      try {
        const userId = users.admin.id;
        const response = await helper.put_request({
          endpoint: `user/disable/${userId}`,
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
  });
  it("should fail if no user found", async () => {
    try {
      const userId = 111111;
      const response = await helper.put_request_with_authorization({
        endpoint: `user/disable/${userId}`,
        token: tokens.testCustomer,
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
  it("should fail if disabling test organization user", async () => {
    try {
      const userId = users.testCustomer.id;
      const response = await helper.put_request_with_authorization({
        endpoint: `user/disable/${userId}`,
        token: tokens.testCustomer,
      });
      expect(response.body).toStrictEqual({
        success: false,
        data: "Can not remove test organization user",
      });
    } catch (error) {
      logger.error(error);
    }
  });
  it("should fail if super admin is trying to disable super admin", async () => {
    try {
      const userId = users.superadmin.id;
      const response = await helper.put_request_with_authorization({
        endpoint: `user/disable/${userId}`,
        token: tokens.superadmin,
      });
      expect(response.body).toStrictEqual({
        success: false,
        data: "Operation can not be performed",
      });
    } catch (error) {
      logger.error(error);
    }
  });
  it("should fail if admin is trying to disable super admin", async () => {
    try {
      const userId = users.superadmin.id;
      const response = await helper.put_request_with_authorization({
        endpoint: `user/disable/${userId}`,
        token: tokens.admin,
      });
      expect(response.body).toStrictEqual({
        success: false,
        data: "Operation can not be performed",
      });
    } catch (error) {
      logger.error(error);
    }
  });
  it("should fail if customer is trying to disable user of other organization", async () => {
    try {
      const userId = users.zongCustomer.id;
      const response = await helper.put_request_with_authorization({
        endpoint: `user/disable/${userId}`,
        token: tokens.testCustomer,
      });
      expect(response.body).toStrictEqual({
        success: false,
        data: "Operation can not be performed",
      });
    } catch (error) {
      logger.error(error);
    }
  });
  it("should fail if ceo is trying to disable user of other organization", async () => {
    try {
      const userId = users.zongCustomer.id;
      const response = await helper.put_request_with_authorization({
        endpoint: `user/disable/${userId}`,
        token: tokens.ceo,
      });
      expect(response.body).toStrictEqual({
        success: false,
        data: "Operation can not be performed",
      });
    } catch (error) {
      logger.error(error);
    }
  });
  it("should fail if login user is trying to disable himself", async () => {
    try {
      const userId = users.zongCustomer.id;
      const response = await helper.put_request_with_authorization({
        endpoint: `user/disable/${userId}`,
        token: tokens.zongCustomer,
      });
      expect(response.body).toStrictEqual({
        success: false,
        data: "Operation can not be performed",
      });
    } catch (error) {
      logger.error(error);
    }
  });
  it("should fail if login user is trying to disable user of status 3", async () => {
    try {
      const userId = 2032;
      const response = await helper.put_request_with_authorization({
        endpoint: `user/disable/${userId}`,
        token: tokens.zongCustomer,
      });
      expect(response.body).toStrictEqual({
        success: false,
        data: "Operation can not be performed",
      });
    } catch (error) {
      logger.error(error);
    }
  });
});
