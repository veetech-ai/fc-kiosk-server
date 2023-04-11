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

describe("Enable user by id user/enable/{userId}", () => {
  describe("Success", () => {
    it("should enable the user if super admin is enabling admin", async () => {
      try {
        const userId = users.admin.id;
        const response = await helper.put_request_with_authorization({
          endpoint: `user/enable/${userId}`,
          token: tokens.superadmin,
        });
        expect(response.body).toStrictEqual({
          success: true,
          data: "User enabled successfully",
        });
        const updatedUser = await get_where({ id: userId });
        expect(updatedUser[0].status).toStrictEqual(1);
      } catch (error) {
        logger.error(error);
      }
    });
    it("should enable the user if admin is enable user of any organization", async () => {
      try {
        const userId = users.zongCustomer.id;
        const response = await helper.put_request_with_authorization({
          endpoint: `user/enable/${userId}`,
          token: tokens.admin,
        });
        expect(response.body).toStrictEqual({
          success: true,
          data: "User enabled successfully",
        });
        const updatedUser = await get_where({ id: userId });
        expect(updatedUser[0].status).toStrictEqual(1);
      } catch (error) {
        logger.error(error);
      }
    });
    it("should enable the user if customer is enabling user of his own organization", async () => {
      try {
        const userId = users.zongCeo.id;
        const response = await helper.put_request_with_authorization({
          endpoint: `user/enable/${userId}`,
          token: tokens.zongCustomer,
        });
        expect(response.body).toStrictEqual({
          success: true,
          data: "User enabled successfully",
        });
      } catch (error) {
        logger.error(error);
      }
    });
    it("should enable the user if ceo is enabling user of his own organization", async () => {
      try {
        const userId = users.zongCustomer.id;
        const response = await helper.put_request_with_authorization({
          endpoint: `user/enable/${userId}`,
          token: tokens.zongCeo,
        });
        expect(response.body).toStrictEqual({
          success: true,
          data: "User enabled successfully",
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
          endpoint: `user/enable/${userId}`,
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
        endpoint: `user/enable/${userId}`,
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
  it("should fail if enabling test organization user", async () => {
    try {
      const userId = users.testCustomer.id;
      const response = await helper.put_request_with_authorization({
        endpoint: `user/enable/${userId}`,
        token: tokens.testCustomer,
      });
      expect(response.body).toStrictEqual({
        success: false,
        data: "Can not enable test organization user",
      });
    } catch (error) {
      logger.error(error);
    }
  });
  it("should fail if super admin is trying to enable super admin", async () => {
    try {
      const userId = users.superadmin.id;
      const response = await helper.put_request_with_authorization({
        endpoint: `user/enable/${userId}`,
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
  it("should fail if admin is trying to enable super admin", async () => {
    try {
      const userId = users.superadmin.id;
      const response = await helper.put_request_with_authorization({
        endpoint: `user/enable/${userId}`,
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
  it("should fail if customer is trying to enable user of other organization", async () => {
    try {
      const userId = users.zongCustomer.id;
      const response = await helper.put_request_with_authorization({
        endpoint: `user/enable/${userId}`,
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
  it("should fail if ceo is trying to enable user of other organization", async () => {
    try {
      const userId = users.zongCustomer.id;
      const response = await helper.put_request_with_authorization({
        endpoint: `user/enable/${userId}`,
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
  it("should fail if login user is trying to enable himself", async () => {
    try {
      const userId = users.zongCustomer.id;
      const response = await helper.put_request_with_authorization({
        endpoint: `user/enable/${userId}`,
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
  it("should fail if login user is trying to enable user of status 3", async () => {
    try {
      const userId = 2032;
      const response = await helper.put_request_with_authorization({
        endpoint: `user/enable/${userId}`,
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
