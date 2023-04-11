const helper = require("../../../helper");
const jwt = require("jsonwebtoken");
const config = require("../../../../config/config");
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
});

describe("update the user role (/user/update/{userId})", () => {
  describe("Fail cases", () => {
    it("should return 401 without authorization token", async () => {
      try {
        const response = await helper.put_request({
          endpoint: `user/update/${users.testCustomer}`,
        });
        expect(response.body).toEqual({
          success: false,
          data: "Token not provided",
        });
      } catch (error) {
        logger.error(error);
      }
    });

    it("should fail when operator updates its own role", async () => {
      try {
        const response = await helper.put_request_with_authorization({
          endpoint: `user/update/${users.testOperator.id}`,
          params: { role: "operator" },
          token: tokens.testOperator,
        });
        expect(response.body).toEqual({
          success: false,
          data: "You are not allowed",
        });
      } catch (error) {
        logger.error(error);
      }
    });

    it("should fail when  operator update the other user role", async () => {
      try {
        const response = await helper.put_request_with_authorization({
          endpoint: `user/update/${users.testCustomer.id}`,
          params: { role: "operator" },
          token: tokens.testOperator,
        });
        expect(response.body).toEqual({
          success: false,
          data: "You are not allowed",
        });
      } catch (error) {
        logger.error(error);
      }
    });

    it("should fail when customer update the other organization user role", async () => {
      try {
        const response = await helper.put_request_with_authorization({
          endpoint: `user/update/${users.zongCustomer.id}`,
          params: { role: "operator" },
          token: tokens.testCustomer,
        });
        expect(response.body).toEqual({
          success: false,
          data: "You cannot update user of other organization",
        });
      } catch (error) {
        logger.error(error);
      }
    });

    it("should fail when invalid role", async () => {
      try {
        const response = await helper.put_request_with_authorization({
          endpoint: `user/update/${users.zongCustomer.id}`,
          params: { role: "role" },
          token: tokens.superadmin,
        });
        expect(response.body).toEqual({
          success: false,
          data: "Role not found",
        });
      } catch (error) {
        logger.error(error);
      }
    });
    it("should fail if manageUser role right tries to update to super", async () => {
      try {
        const response = await helper.put_request_with_authorization({
          endpoint: `user/update/${users.zongCustomer.id}`,
          params: { role: "super admin" },
          token: tokens.zongCustomer,
        });
        expect(response.body).toEqual({
          success: false,
          data: "You are not allowed",
        });
      } catch (error) {
        logger.error(error);
      }
    });
    it("should fail if manageUser role right tries to update to admin", async () => {
      try {
        const response = await helper.put_request_with_authorization({
          endpoint: `user/update/${users.zongCustomer.id}`,
          params: { role: "admin" },
          token: tokens.zongCustomer,
        });
        expect(response.body).toEqual({
          success: false,
          data: "You are not allowed",
        });
      } catch (error) {
        logger.error(error);
      }
    });
  });

  describe("Success cases", () => {
    it("should pass when super admin update the user role", async () => {
      try {
        const response = await helper.put_request_with_authorization({
          endpoint: `user/update/${users.testOperator.id}`,
          params: { role: "customer", name: "Operator" },
          token: tokens.superadmin,
        });
        expect(response.body).toEqual({
          success: true,
          data: "User Updated Successfully",
        });
        await helper.put_request_with_authorization({
          endpoint: `user/update/${users.testOperator.id}`,
          params: {
            role: "operator",
            name: "Test Organization Operator account",
          },
          token: tokens.superadmin,
        });
      } catch (error) {
        logger.error(error);
      }
    });
    it("should update successfully the operator to customer and then that operator (now customer) should be able to update any other user of his/her own organization", async () => {
      try {
        const response = await helper.put_request_with_authorization({
          endpoint: `user/update/${users.testOperator.id}`,
          params: { role: "customer" },
          token: tokens.testCustomer,
        });
        expect(response.body).toEqual({
          success: true,
          data: "User Updated Successfully",
        });
        // needs to login again to get the updated role
        const testOperatorAsCustomerToken = await helper.get_token_for(
          "testOperator",
          true,
        );
        const response2 = await helper.put_request_with_authorization({
          endpoint: `user/update/${users.testOperator.id}`,
          params: {
            role: "operator",
            name: "Test Organization Operator account",
          },
          token: testOperatorAsCustomerToken,
        });
        expect(response2.body).toStrictEqual({
          success: true,
          data: "User Updated Successfully",
        });
        tokens.testOperator = testOperatorAsCustomerToken;
      } catch (error) {
        logger.error(error);
      }
    });
  });
});
