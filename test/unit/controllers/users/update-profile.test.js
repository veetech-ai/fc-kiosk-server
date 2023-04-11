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
afterAll(async () => {
  try {
    await helper.put_request_with_authorization({
      endpoint: "user/update/profile",
      params: {
        name: "Test Organization Operator account",
      },
      token: tokens.testOperator,
    });
  } catch (error) {
    logger.error(error);
  }
});
describe('Tests to update User Profile API URI: "user/update/profile"', () => {
  describe("Success Scenarios", () => {
    describe("Phone Number Success Scenarios", () => {
      it("Should pass when valid phone format", async () => {
        const res = await helper.put_request_with_authorization({
          endpoint: "user/update/profile",
          params: {
            phone: "+15417545594",
            name: users.superadmin.name,
          },
          token: tokens.superadmin,
        });
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
      });
      it("Should pass when valid phone format and name is not in params", async () => {
        const res = await helper.put_request_with_authorization({
          endpoint: "user/update/profile",
          params: {
            phone: "+15417545593",
          },
          token: tokens.superadmin,
        });
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        const res2 = await helper.get_request_with_authorization({
          endpoint: "user/profile",
          token: tokens.superadmin,
        });
        expect(res2.statusCode).toEqual(200);
        expect(res2.body.success).toBe(true);
        expect(res2.body.data.phone).toEqual("+15417545593");
      });
      it("Should update phone number of operator", async () => {
        const res = await helper.put_request_with_authorization({
          endpoint: "user/update/profile",
          params: {
            phone: "+15417545591",
          },
          token: tokens.testOperator,
        });
        expect(res.body.success).toBe(true);
        expect(res.statusCode).toEqual(200);
        const res2 = await helper.get_request_with_authorization({
          endpoint: "user/profile",
          token: tokens.testOperator,
        });
        expect(res2.statusCode).toEqual(200);
        expect(res2.body.success).toBe(true);
        expect(res2.body.data.phone).toEqual("+15417545591");
      });
    });
    describe("Profile Name Success Scenarios", () => {
      it("Should update name of operator starting with an alphabet", async () => {
        const names = ["James", "MY name", "Ali"];
        const data = {
          endpoint: "user/update/profile",
          token: tokens.testOperator,
        };
        const promiseArray = [];
        names.forEach((uName) =>
          promiseArray.push(
            helper.put_request_with_authorization({
              ...data,
              params: { name: uName },
            }),
          ),
        );
        const response = await Promise.all(promiseArray);
        response.forEach((res) => {
          expect(res.statusCode).toBe(200);
          expect(res.body.success).toBe(true);
        });
      });

      it("Should update name of operator which contains number in between", async () => {
        const names = ["James 1 Ali", "MY 2 name", "Ali 90 V"];
        const data = {
          endpoint: "user/update/profile",
          token: tokens.testOperator,
        };
        const promiseArray = [];
        names.forEach((uName) =>
          promiseArray.push(
            helper.put_request_with_authorization({
              ...data,
              params: { name: uName },
            }),
          ),
        );
        const response = await Promise.all(promiseArray);
        response.forEach((res) => {
          expect(res.statusCode).toBe(200);
          expect(res.body.success).toBe(true);
        });
      });

      it('Should update name of operator which contains "."(dot) special character in between', async () => {
        const names = ["James.Ali", "MY.name", "Ali.V"];
        const data = {
          endpoint: "user/update/profile",
          token: tokens.testOperator,
        };
        const promiseArray = [];
        names.forEach((uName) =>
          promiseArray.push(
            helper.put_request_with_authorization({
              ...data,
              params: { name: uName },
            }),
          ),
        );
        const response = await Promise.all(promiseArray);
        response.forEach((res) => {
          expect(res.statusCode).toBe(200);
          expect(res.body.success).toBe(true);
        });
      });

      it('Should update name of operator which contains "\'"(Apostrophe) special character in between', async () => {
        const names = ["James's", "Ali's", "Hassan's"];
        const data = {
          endpoint: "user/update/profile",
          token: tokens.testOperator,
        };
        const promiseArray = [];
        names.forEach((uName) =>
          promiseArray.push(
            helper.put_request_with_authorization({
              ...data,
              params: { name: uName },
            }),
          ),
        );
        const response = await Promise.all(promiseArray);
        response.forEach((res) => {
          expect(res.statusCode).toBe(200);
          expect(res.body.success).toBe(true);
        });
      });

      it("Should update name of operator which ends with number", async () => {
        const names = ["Jamess 1", "Ali 2", "Hassan 3"];
        const data = {
          endpoint: "user/update/profile",
          token: tokens.testOperator,
        };
        const promiseArray = [];
        names.forEach((uName) =>
          promiseArray.push(
            helper.put_request_with_authorization({
              ...data,
              params: { name: uName },
            }),
          ),
        );
        const response = await Promise.all(promiseArray);
        response.forEach((res) => {
          expect(res.statusCode).toBe(200);
          expect(res.body.success).toBe(true);
        });
      });

      it('Should update name of operator which ends with "."(Dot)', async () => {
        const names = ["Jamess.", "Ali.", "Hassan ."];
        const data = {
          endpoint: "user/update/profile",
          token: tokens.testOperator,
        };
        const promiseArray = [];
        names.forEach((uName) =>
          promiseArray.push(
            helper.put_request_with_authorization({
              ...data,
              params: { name: uName },
            }),
          ),
        );
        const response = await Promise.all(promiseArray);
        response.forEach((res) => {
          expect(res.statusCode).toBe(200);
          expect(res.body.success).toBe(true);
        });
      });
    });
  });

  describe("Failure Scenarios", () => {
    describe("Role access denied", () => {
      it("Should not update the role of the user with operator role", async () => {
        const res = await helper.put_request_with_authorization({
          endpoint: "user/update/profile",
          params: {
            role: "customer",
          },
          token: tokens.testOperator,
        });
        expect(res.body.success).toBe(false);
      });
    });

    describe("Phone number Failure Scenarios", () => {
      it("Should return error when invalid phone format", async () => {
        const res = await helper.put_request_with_authorization({
          endpoint: "user/update/profile",
          params: {
            phone: "987654321",
            name: users.superadmin.name,
          },
          token: tokens.superadmin,
        });
        expect(res.body.success).toBe(false);
        expect(res.statusCode).toEqual(400);
      });
    });

    describe("Profile name Failure Scenarios", () => {
      it("Should not update name of operator which starts with number", async () => {
        const names = ["1 Jamess 1", "2 Ali 2", "0Hassan 3"];
        const data = {
          endpoint: "user/update/profile",
          token: tokens.testOperator,
        };
        const promiseArray = [];
        names.forEach((uName) =>
          promiseArray.push(
            helper.put_request_with_authorization({
              ...data,
              params: { name: uName },
            }),
          ),
        );
        const response = await Promise.all(promiseArray);
        response.forEach((res) => {
          expect(res.statusCode).toBe(400);
          expect(res.body.success).toBe(false);
        });
      });

      it('Should not update name of operator which starts with "."(dot)', async () => {
        const names = [".Jamess 1", ".Ali 2", ".Hassan 3"];
        const data = {
          endpoint: "user/update/profile",
          token: tokens.testOperator,
        };
        const promiseArray = [];
        names.forEach((uName) =>
          promiseArray.push(
            helper.put_request_with_authorization({
              ...data,
              params: { name: uName },
            }),
          ),
        );
        const response = await Promise.all(promiseArray);
        response.forEach((res) => {
          expect(res.statusCode).toBe(400);
          expect(res.body.success).toBe(false);
        });
      });

      it('Should not update name of operator which contains any special character other than "."(dot) and "\'"(Apostrophy)', async () => {
        const names = [
          "Jamess~1",
          "`Ali@2",
          "_Hassan 3",
          "My % Name",
          "-James's",
          "My % Name",
          "MY_name",
          "MY@name",
          "/M Ali",
          "M+K Morgan",
        ];
        const data = {
          endpoint: "user/update/profile",
          token: tokens.testOperator,
        };
        const promiseArray = [];
        names.forEach((uName) =>
          promiseArray.push(
            helper.put_request_with_authorization({
              ...data,
              params: { name: uName },
            }),
          ),
        );
        const response = await Promise.all(promiseArray);
        response.forEach((res) => {
          expect(res.statusCode).toBe(400);
          expect(res.body.success).toBe(false);
        });
      });

      it("Should not update name of operator which ends with space ", async () => {
        const names = ["Jamess 1 ", ".Ali 2 ", " Hassan 3 "];
        const data = {
          endpoint: "user/update/profile",
          token: tokens.testOperator,
        };
        const promiseArray = [];
        names.forEach((uName) =>
          promiseArray.push(
            helper.put_request_with_authorization({
              ...data,
              params: { name: uName },
            }),
          ),
        );
        const response = await Promise.all(promiseArray);
        response.forEach((res) => {
          expect(res.statusCode).toBe(400);
          expect(res.body.success).toBe(false);
        });
      });
    });
  });
});
