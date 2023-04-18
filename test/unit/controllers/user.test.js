const { uuid } = require("uuidv4");
const jwt = require("jsonwebtoken");

const models = require("../../../models");
const User = models.User;

const helper = require("../../helper");
const mainHelper = require("../../../common/helper");
const config = require("../../../config/config");
const mailer = require("../../../common/email");

const { logger } = require("../../../logger");
const { products } = require("../../../common/products");
const { getByPhone } = require("../../../services/otp");

const validUserId1 = 1;
const validUserId2 = 2;
const userIdWithNoFile = 6;
const inValidUserId = -2;
let tokens, testOrganizationUserId, superAdminId;
let devices = [];
const userIds = {};
const nonExistedUserId = -1;
const invalidRole = "invalid role";
const zongCustomerEmail = "zong.viaphoton@cowlar.com";
const testCustomerEmail = config.testAccountEmail;
let zongCustomerId = null;
let testCustomerId = null;

async function createNewDevices(token) {
  const devicesData = [
    {
      device_type: products.kiosk.id,
      serial: uuid(),
      pin_code: "1111",
    },
    {
      device_type: products.kiosk.id,
      serial: uuid(),
      pin_code: "1111",
    },
  ];
  const data = {
    endpoint: "device/create",
    token,
  };
  const devices = [];
  for await (const value of Object.values(devicesData)) {
    data.params = value;
    const device = await helper.post_request_with_authorization(data);
    devices.push(device.body.data);
  }
  return devices;
}
const Orgs = {
  testOrg: {
    id: 1,
  },
  org1: {
    id: 4,
  },
};
describe("user test cases", () => {
  beforeAll(async () => {
    tokens = await helper.get_all_roles_tokens();
    devices = await createNewDevices(tokens.superadmin);
    userIds.testCustomer = jwt.verify(tokens.testCustomer, config.jwt.secret);
    userIds.superadmin = jwt.verify(tokens.superadmin, config.jwt.secret);
    userIds.admin = jwt.verify(tokens.admin, config.jwt.secret);
    userIds.zongCustomer = jwt.verify(tokens.zongCustomer, config.jwt.secret);
    userIds.testOperator = jwt.verify(tokens.testOperator, config.jwt.secret);

    testOrganizationUserId = userIds.testCustomer.id;
    superAdminId = userIds.superadmin.id;
    zongCustomerId = userIds.zongCustomer.id;
    testCustomerId = userIds.testCustomer.id;
  });
  describe("/user/invite-user", () => {
    const email = {
      nonExistingEmail1: "otherorg@email.com",
      nonExistingEmail2: "otherorg2@email.com",
      nonExistingEmail3: "otherorg3@email.com",
      nonExistingEmail4: "otherorg4@email.com",
      nonExistingEmail5: "otherorg5@email.com",
      nonExistingEmail6: "otherorg6@email.com",
      nonExistingEmail7: "otherorg7@email.com",
      nonExistingEmail8: "admin1@email.com",
      existingEmail: config.testAccountEmail,
    };

    it("invitation sent successfully with super admin account", async () => {
      const data = {
        params: {
          orgId: Orgs.org1.id,
          role: "customer",
          email: email.nonExistingEmail1,
        },
        token: tokens.superadmin,
        endpoint: "user/invite-user",
      };

      const response = await helper.post_request_with_authorization(data);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toBe("User Invited successfully");
      expect(response.body.data.userId).toBeGreaterThan(0);

      let response404 = await helper.get_request_with_authorization({
        token: tokens.admin,
        endpoint: `user/email-token/${email.nonExistingEmail1}`,
      });
      expect(response404.status).toBe(403);

      const response2 = await helper.get_request_with_authorization({
        token: tokens.superadmin,
        endpoint: `user/email-token/${email.nonExistingEmail1}`,
      });
      expect(response2.status).toBe(200);
      expect(response2.body.data).toEqual(expect.anything());

      response404 = await helper.post_request_with_authorization({
        endpoint: `user/complete-registration?token=${tokens.superadmin}`,
        params: {
          name: "non existing 1",
          email: email.nonExistingEmail1,
          password: "123546789",
          password_confirmation: "123546789",
          phone: "+923001234567",
        },
      });
      expect(response404.status).toBe(500);

      const verifyToken = response2.body.data;
      const response3 = await helper.post_request_with_authorization({
        endpoint: `user/complete-registration?token=${verifyToken}`,
        params: {
          name: "non existing 1",
          email: email.nonExistingEmail1,
          password: "123546789",
          password_confirmation: "123546789",
          phone: "+923001234567",
        },
      });
      expect(response3.status).toBe(200);
      expect(response3.body.data.accessToken).toEqual(expect.anything());
    });

    it("invitation sent successfully with admin account", async () => {
      const data = {
        params: {
          orgId: Orgs.org1.id,
          role: "customer",
          email: email.nonExistingEmail2,
        },
        token: tokens.admin,
        endpoint: "user/invite-user",
      };
      const response = await helper.post_request_with_authorization(data);
      expect(response.status).toBe(200);
      expect(response.body.data.message).toBe("User Invited successfully");
    });

    it.skip("should return fail if invitation already sent", async () => {
      const data = {
        params: {
          orgId: Orgs.org1.id,
          role: "customer",
          email: email.nonExistingEmail2,
        },
        token: tokens.superadmin,
        endpoint: "user/invite-user",
      };
      const response = await helper.post_request_with_authorization(data);
      expect(response.status).toBe(422);
      expect(response.body.data).toBe("Invitation already sent");
    });
    it("user creation failed, as email already exists", async () => {
      const data = {
        params: {
          orgId: Orgs.org1.id,
          role: "customer",
          email: email.existingEmail,
        },
        token: tokens.admin,
        endpoint: "user/invite-user",
      };
      const response = await helper.post_request_with_authorization(data);
      expect(response.status).toBe(422);
      expect(response.body).toStrictEqual({
        success: false,
        data: "Email already exists",
      });
    });
    it("validation layer => user creation failed when email is not provided", async () => {
      const data = {
        params: {
          orgId: Orgs.testOrg.id,
          role: "customer",
        },
        token: tokens.superadmin,
        endpoint: "user/invite-user",
      };
      const response = await helper.post_request_with_authorization(data);
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.data.errors.email[0]).toBe(
        "The email field is required.",
      );
    });
    it("validation layer => user creation failed when role is not provided", async () => {
      const data = {
        params: {
          orgId: Orgs.testOrg.id,
          email: email.nonExistingEmail3,
        },
        token: tokens.superadmin,
        endpoint: "user/invite-user",
      };
      const response = await helper.post_request_with_authorization(data);
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.data.errors.role[0]).toBe(
        "The role field is required.",
      );
    });
    it("validation layer => user creation failed for operator account, as operator is not allowed to create user", async () => {
      const data = {
        params: {
          orgId: Orgs.testOrg.id,
          role: "customer",
          email: email.nonExistingEmail3,
        },
        token: tokens.testOperator,
        endpoint: "user/invite-user",
      };
      const response = await helper.post_request_with_authorization(data);
      expect(response.status).toBe(403);
      expect(response.body).toStrictEqual({
        success: false,
        data: "You are not allowed",
      });
    });
    it("validation layer => user creation failed for customer account, if organization id provided in the body does not match with that of the customer account", async () => {
      const data = {
        params: {
          orgId: Orgs.org1.id,
          role: "customer",
          email: email.nonExistingEmail3,
        },
        token: tokens.testCustomer,
        endpoint: "user/invite-user",
      };
      const response = await helper.post_request_with_authorization(data);
      expect(response.status).toBe(403);
      expect(response.body).toStrictEqual({
        success: false,
        data: "You are not allowed",
      });
    });
    it("user creation failed for the Test organization, as test organizational users are seeded and fixed", async () => {
      const data = {
        params: {
          orgId: Orgs.testOrg.id,
          role: "customer",
          email: email.nonExistingEmail3,
        },
        token: tokens.superadmin,
        endpoint: "user/invite-user",
      };
      const response = await helper.post_request_with_authorization(data);
      // expect(response.status).toBe(403)
      expect(response.body).toStrictEqual({
        success: false,
        data: "Can not add user to test organization",
      });
    });
    it("should return Role not found if invalid role is sent", async () => {
      const data = {
        params: {
          orgId: Orgs.org1.id,
          role: invalidRole,
          email: email.nonExistingEmail3,
        },
        token: tokens.superadmin,
        endpoint: "user/invite-user",
      };
      const response = await helper.post_request_with_authorization(data);
      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({
        success: false,
        data: "Role not found",
      });
    });
    it("successfully invite a manager while setting the report to field with customer id", async () => {
      const data = {
        params: {
          orgId: Orgs.org1.id,
          role: "manager",
          email: email.nonExistingEmail5,
          reportTo: zongCustomerId,
        },
        token: tokens.superadmin,
        endpoint: "user/invite-user",
      };

      const response = await helper.post_request_with_authorization(data);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toBe("User Invited successfully");
      expect(response.body.data.userId).toBeGreaterThan(0);

      const invitedUser = await User.findOne({
        where: { email: email.nonExistingEmail5 },
      });

      expect(invitedUser.reportTo).toEqual(zongCustomerId);
    });

    it("Should send 400 if the report to user belong to other organization", async () => {
      const data = {
        params: {
          orgId: Orgs.org1.id,
          role: "manager",
          email: email.nonExistingEmail6,
          reportTo: testCustomerId,
        },
        token: tokens.superadmin,
        endpoint: "user/invite-user",
      };

      const response = await helper.post_request_with_authorization(data);

      expect(response.status).toBe(400);
      expect(response.body.data).toBe("Report to user id is incorrect");
    });

    it("Should send 400 if the report to user id is incorrect", async () => {
      const wrongReportToUserId = -1;
      const data = {
        params: {
          orgId: Orgs.org1.id,
          role: "manager",
          email: email.nonExistingEmail7,
          reportTo: wrongReportToUserId,
        },
        token: tokens.superadmin,
        endpoint: "user/invite-user",
      };

      const response = await helper.post_request_with_authorization(data);

      expect(response.status).toBe(400);
      expect(response.body.data).toBe("Report to user id is incorrect");
    });

    it("Should send 403 if assigning customer report to customer", async () => {
      const data = {
        params: {
          orgId: Orgs.org1.id,
          role: "customer",
          email: email.nonExistingEmail7,
          reportTo: zongCustomerId,
        },
        token: tokens.superadmin,
        endpoint: "user/invite-user",
      };

      const response = await helper.post_request_with_authorization(data);

      expect(response.status).toBe(403);
      expect(response.body.data).toBe("Invalid role of report to user");
    });

    it("Should send bad request if assigning admin report to superadmin", async () => {
      const data = {
        params: {
          role: "admin",
          email: email.nonExistingEmail8,
          reportTo: superAdminId,
        },
        token: tokens.superadmin,
        endpoint: "user/invite-user",
      };

      const response = await helper.post_request_with_authorization(data);

      expect(response.status).toBe(403);
      expect(response.body.data).toBe("Invalid role of report to user");
    });
  });
  describe("/user/disable/{id}", () => {
    /** TODO:
     * Customer can delete the user of its own organization
     * Super Admin and Admin can delete any user
     * NOTE: For above tasks we need to create some dummy users in organization other than Test
     **/
    it("should return User not found if the user to be deleted does not exist", async () => {
      const data = {
        endpoint: `user/disable/${nonExistedUserId}`,
        token: tokens.superadmin,
      };
      const response = await helper.put_request_with_authorization(data);
      expect(response.body.data).toBe("User not found");
      expect(response.status).toBe(400);
    });
    it("test organization user can not be deleted by any one", async () => {
      const data = {
        endpoint: `user/disable/${testOrganizationUserId}`,
        token: tokens.testCustomer,
      };
      const response = await helper.put_request_with_authorization(data);

      expect(response.body.data).toBe("Can not remove test organization user");
      expect(response.status).toBe(400);
    });
    //TODO: need to investigate later
    it.skip("super admin can not be deleted by an admin", async () => {
      const data = {
        endpoint: `user/disable/${superAdminId}`,
        token: tokens.admin,
      };
      const response = await helper.put_request_with_authorization(data);

      expect(response.body.data).toBe("Operation can not be performed");
      expect(response.status).toBe(400);
    });
    it("super admin can not be deleted by a customer of any organization", async () => {
      const data = {
        endpoint: `user/disable/${superAdminId}`,
        token: tokens.testCustomer,
      };
      const response = await helper.put_request_with_authorization(data);
      expect(response.body.data).toBe("Operation can not be performed");
      expect(response.status).toBe(400);
    });
  });
  describe("/user/enable/{id}", () => {
    /** TODO:
     * Customer can enable the user of its own organization
     * Super Admin and Admin can enable any user
     * NOTE: For above tasks we need to create some dummy users in organization other than Test
     **/
    it("should return User not found if the user to be deleted does not exist", async () => {
      const data = {
        endpoint: `user/enable/${nonExistedUserId}`,
        token: tokens.superadmin,
      };
      const response = await helper.put_request_with_authorization(data);

      expect(response.body.data).toBe("User not found");
      expect(response.status).toBe(400);
    });
    it("test organization user can not be enabled by any one", async () => {
      const data = {
        endpoint: `user/enable/${testOrganizationUserId}`,
        token: tokens.testCustomer,
      };
      const response = await helper.put_request_with_authorization(data);

      expect(response.body.data).toBe("Can not enable test organization user");
      expect(response.status).toBe(400);
    });
    it("super admin can not be enabled by an admin", async () => {
      const data = {
        endpoint: `user/enable/${superAdminId}`,
        token: tokens.admin,
      };
      const response = await helper.put_request_with_authorization(data);

      expect(response.body.data).toBe("Operation can not be performed");
      expect(response.status).toBe(400);
    });
    it("super admin can not be enabled by a customer of any organization", async () => {
      const data = {
        endpoint: `user/enable/${superAdminId}`,
        token: tokens.testCustomer,
      };
      const response = await helper.put_request_with_authorization(data);
      expect(response.body.data).toBe("Operation can not be performed");
      expect(response.status).toBe(400);
    });
  });

  describe("/user/resend-invitation", () => {
    describe("fail response", () => {
      it("should return false if email is not provided", async () => {
        const res = await helper.post_request_with_authorization({
          endpoint: "user/resend-invitation",
          params: {},
          token: tokens.superadmin,
        });
        const error = res.body.data.errors.email[0];
        const expectedError = "The email field is required.";
        expect(error).toBe(expectedError);
        expect(res.statusCode).toBe(400);
      });

      it("should return false if user is not invited before re invitation", async () => {
        const res = await helper.post_request_with_authorization({
          endpoint: "user/resend-invitation",
          params: { email: "user@example.com" },
          token: tokens.superadmin,
        });
        const error = res.body.data;
        const expectedError = "invalidEmail";
        expect(error).toBe(expectedError);
        expect(res.statusCode).toBe(400);
      });

      it("should return false if user already registered on the email", async () => {
        const res = await helper.post_request_with_authorization({
          endpoint: "user/resend-invitation",
          params: { email: config.testAccountEmail },
          token: tokens.superadmin,
        });
        const error = res.body.data;
        const expectedError = "User already registered on this email";
        expect(error).toBe(expectedError);
        expect(res.statusCode).toBe(400);
      });
    });
    describe("success response", () => {
      const email = `new${uuid()}@gmail.com`;

      it("successfully invite user before re-invitation", async () => {
        const res = await helper.post_request_with_authorization({
          endpoint: "user/invite-user",
          params: { email: email, role: "customer", orgId: Orgs.org1.id },
          token: tokens.superadmin,
        });
        expect(res.body.success).toBe(true);
      });

      it("successfully send re-invitation", async () => {
        const res = await helper.post_request_with_authorization({
          endpoint: "user/resend-invitation",
          params: { email: email },
          token: tokens.superadmin,
        });
        const expectedResponseMessage = "User re-Invited successfully";

        expect(res.body.success).toBe(true);
        expect(res.body.data.message).toBe(expectedResponseMessage);
      });
    });
  });

  describe("/user/all/{organizationId}", () => {
    const expectedMinimalResponseProperties = {
      id: 1,
      name: "abc",
      cardSerial: null,
    };
    const existingTestOrganizationId = 1;
    it("successfully get minimal response if minimal option is selected", async () => {
      const data = {
        queryParams: {
          minimal: true,
        },
        token: tokens.admin,
        endpoint: `user/all/${existingTestOrganizationId}`,
      };
      const response = await helper.get_request_with_authorization(data);
      const receivedMinimalKeys = Object.keys(response.body.data[0]);
      const expectedMinimalKeys = Object.keys(
        expectedMinimalResponseProperties,
      );
      expect(receivedMinimalKeys).toEqual(expectedMinimalKeys);
    });

    it("successfully get full response if minimal option is not selected", async () => {
      const data = {
        queryParams: {
          minimal: false,
        },
        token: tokens.admin,
        endpoint: `user/all/${existingTestOrganizationId}`,
      };
      const response = await helper.get_request_with_authorization(data);
      const receivedMinimalKeys = Object.keys(response.body.data[0]);
      expect(receivedMinimalKeys.length).toBeGreaterThan(3);
    });

    it("successfully get full response if minimal option is not selected as false", async () => {
      const data = {
        token: tokens.admin,
        endpoint: `user/all/${existingTestOrganizationId}`,
      };
      const response = await helper.get_request_with_authorization(data);
      const receivedMinimalKeys = Object.keys(response.body.data[0]);
      expect(receivedMinimalKeys.length).toBeGreaterThan(3);
    });
    it("should get it own login history", async () => {
      const data = {
        token: tokens.testOperator,
        endpoint: "user/last-login-info",
      };
      const response = await helper.get_request_with_authorization(data);
      expect(response.statusCode).toEqual(200);
    });
    it("should not get it login history of other user if does not have manageUser rights", async () => {
      const data = {
        token: tokens.testOperator,
        endpoint: "user/last-login-info",
        queryParams: { user_id: testOrganizationUserId },
      };
      const response = await helper.get_request_with_authorization(data);
      expect(response.statusCode).toEqual(403);
    });
    it("should not get it login history of other user of different org if does not have manageUser rights", async () => {
      const data = {
        token: tokens.testCustomer,
        endpoint: "user/last-login-info",
        queryParams: { user_id: userIds.zongCustomer.id },
      };
      const response = await helper.get_request_with_authorization(data);
      expect(response.statusCode).toEqual(403);
    });

    it("should get it login history of other user of same org and have manageUser rights", async () => {
      const data = {
        token: tokens.testCustomer,
        endpoint: "user/last-login-info",
        queryParams: { user_id: userIds.testOperator.id },
      };
      const response = await helper.get_request_with_authorization(data);
      expect(response.statusCode).toEqual(200);
    });
    it("should get it login history of other user if have super rights", async () => {
      const data = {
        token: tokens.superadmin,
        endpoint: "user/last-login-info",
        queryParams: { user_id: userIds.testOperator.id },
      };
      const response = await helper.get_request_with_authorization(data);
      expect(response.statusCode).toEqual(200);
    });
    it("should not get it login history of other user if does not have super rights", async () => {
      const data = {
        token: tokens.admin,
        endpoint: "user/last-login-info",
        queryParams: { user_id: userIds.testOperator.id },
      };
      const response = await helper.get_request_with_authorization(data);
      expect(response.statusCode).toEqual(403);
    });

    it("should get login history of its own user  even if does not have super rights", async () => {
      const data = {
        token: tokens.admin,
        endpoint: "user/last-login-info",
        queryParams: { user_id: userIds.admin.id },
      };
      const response = await helper.get_request_with_authorization(data);
      expect(response.statusCode).toEqual(200);
    });
    it("should not give error if the user does not exit", async () => {
      const data = {
        token: tokens.superadmin,
        endpoint: "user/last-login-info",
        queryParams: { user_id: 500 },
      };
      const response = await helper.get_request_with_authorization(data);
      expect(response.statusCode).toEqual(404);
    });
    // all-login-info
    it("should get it own login history", async () => {
      const data = {
        token: tokens.testOperator,
        endpoint: "user/all-login-info",
      };
      const response = await helper.get_request_with_authorization(data);
      expect(response.statusCode).toEqual(200);
    });
    it("should not get it login history of other user if does not have manageUser rights", async () => {
      const data = {
        token: tokens.testOperator,
        endpoint: "user/all-login-info",
        queryParams: { user_id: testOrganizationUserId },
      };
      const response = await helper.get_request_with_authorization(data);
      expect(response.statusCode).toEqual(403);
    });
    it("should not get it login history of other user of different org if does not have manageUser rights", async () => {
      const data = {
        token: tokens.testCustomer,
        endpoint: "user/all-login-info",
        queryParams: { user_id: userIds.zongCustomer.id },
      };
      const response = await helper.get_request_with_authorization(data);
      expect(response.statusCode).toEqual(403);
    });

    it("should get it login history of other user of same org and have manageUser rights", async () => {
      const data = {
        token: tokens.testCustomer,
        endpoint: "user/last-login-info",
        queryParams: { user_id: userIds.testOperator.id },
      };
      const response = await helper.get_request_with_authorization(data);
      expect(response.statusCode).toEqual(200);
    });
    it("should get it login history of other user if have super rights", async () => {
      const data = {
        token: tokens.superadmin,
        endpoint: "user/all-login-info",
        queryParams: { user_id: userIds.testOperator.id },
      };
      const response = await helper.get_request_with_authorization(data);
      expect(response.statusCode).toEqual(200);
    });
    it("should not get it login history of other user if does not have super rights", async () => {
      const data = {
        token: tokens.admin,
        endpoint: "user/all-login-info",
        queryParams: { user_id: userIds.testOperator.id },
      };
      const response = await helper.get_request_with_authorization(data);
      expect(response.statusCode).toEqual(403);
    });

    it("should get login history of its own user  even if does not have super rights", async () => {
      const data = {
        token: tokens.admin,
        endpoint: "user/all-login-info",
        queryParams: { user_id: userIds.admin.id },
      };
      const response = await helper.get_request_with_authorization(data);
      expect(response.statusCode).toEqual(200);
    });
    it("should not give error if the user does not exit", async () => {
      const data = {
        token: tokens.superadmin,
        endpoint: "user/all-login-info",
        queryParams: { user_id: 500 },
      };
      const response = await helper.get_request_with_authorization(data);
      expect(response.statusCode).toEqual(404);
    });

    it("should upload picture of user ", async () => {
      const data = {
        token: tokens.testOperator,
        endpoint: "user/upload/profile-image",
        fileupload: 1,
        params: {
          file_key: "profile_image",
          file_path: "check.png",
        },
      };
      const response = await helper.post_request_with_authorization(data);
      expect(response.statusCode).toEqual(200);
    });

    it("should upload picture of user ", async () => {
      const data = {
        token: tokens.testCustomer,
        endpoint: "user/upload/profile-image",
        fileupload: 1,
        params: {
          file_key: "profile_image",
          file_path: "check.png",
        },
      };
      const response = await helper.post_request_with_authorization(data);
      expect(response.statusCode).toEqual(200);
    });
    it("should not upload picture if not JPEG or PNG ", async () => {
      const data = {
        token: tokens.testOperator,
        endpoint: "user/upload/profile-image",
        fileupload: 1,
        params: {
          file_key: "profile_image",
          file_path: "test.bin",
        },
      };
      const response = await helper.post_request_with_authorization(data);
      expect(response.statusCode).toEqual(400);
    });
  });

  describe("user/card/{userId}/{cardSerial}", () => {
    const serialNumber = 123654;
    it("Should pass when valid user id", async () => {
      const res = await helper.put_request_with_authorization({
        endpoint: `user/card/${userIds.testOperator.id}/${serialNumber}`,
        token: tokens.admin,
        params: {
          deviceId: devices[0].id,
        },
      });
      expect(res.body.success).toBe(true);
      expect(res.statusCode).toEqual(200);
    });

    it("Should pass and overwrite card serial", async () => {
      const res = await helper.put_request_with_authorization({
        endpoint: `user/card/${userIds.testOperator.id}/${serialNumber}`,
        token: tokens.admin,
        params: {
          deviceId: devices[0].id,
        },
      });
      expect(res.body.success).toBe(true);
      expect(res.statusCode).toEqual(200);
    });

    it("Should pass and matched card serial with admin", async () => {
      const deviceId = devices[0].id;
      const res = await helper.get_request_with_authorization({
        endpoint: `user/card/${serialNumber}/${deviceId}`,
        token: tokens.admin,
      });
      expect(res.body.success).toBe(true);
      expect(res.statusCode).toEqual(200);
      // expect(res.body.data.id).toEqual(userIds.admin.id);
    });

    it("Should pass and superadmin card serial should be null", async () => {
      const res = await helper.get_request_with_authorization({
        endpoint: `user/get/${superAdminId}`,
        token: tokens.superadmin,
      });
      expect(res.body.success).toBe(true);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.cardSerial).toEqual(null);
    });

    it("Should fail when invalid user id", async () => {
      const res = await helper.put_request_with_authorization({
        endpoint: `user/card/${nonExistedUserId}/${serialNumber}`,
        token: tokens.superadmin,
        params: {
          deviceId: devices[1].id,
        },
      });
      expect(res.body.success).toBe(false);
      expect(res.body.data).toBe("User not found");
      expect(res.statusCode).toEqual(404);
    });

    it("Should not able to update when user is customer but belong to different organization", async () => {
      const res = await helper.put_request_with_authorization({
        endpoint: `user/card/${userIds.testCustomer.id}/${serialNumber}`,
        token: tokens.zongCustomer,
      });
      expect(res.body.success).toBe(false);
      expect(res.statusCode).toEqual(404);
    });
  });

  describe("GET user/profile", () => {
    it("should return 401 without authorization token", async () => {
      const response = await helper.get_request({
        endpoint: "user/profile",
      });
      expect(response.body).toEqual({
        success: false,
        data: "Token not provided",
      });
    });
    it("should return user own profile information for every role", async () => {
      const roles = {
        [helper.super_admin_email]: tokens.superadmin,
        [helper.admin_email]: tokens.admin,
        [helper.testOperatorEmail]: tokens.testOperator,
        [helper.testCeoEmail]: tokens.ceo,
        [helper.zongCustomerEmail]: tokens.zongCustomer,
      };
      for await (const [email, token] of Object.entries(roles)) {
        const response = await helper.get_request_with_authorization({
          endpoint: "user/profile",
          token: token,
        });
        expect(response.status).toEqual(200);
        expect(email).toEqual(response.body?.data?.email);
      }
    });
    it("should not return the expected fields", async () => {
      const data = {
        token: tokens.testOperator,
        endpoint: "user/profile",
      };
      const expectedResponseKeys = [
        "first_name",
        "last_name",
        "id",
        "name",
        "email",
        "phone",
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
        "reportTo",
        "role_id",
        "User_Settings",
        "Organization",
        "Role",
        "devices",
      ];
      const response = await helper.get_request_with_authorization(data);
      expect(Object.keys(response.body.data)).toEqual(
        expect.arrayContaining(expectedResponseKeys),
      );
    });
  });

  describe("GET get/:userId", () => {
    it("should return 401 without authorization token", async () => {
      const response = await helper.get_request({
        endpoint: `user/get/${-10}`,
      });
      expect(response.body).toEqual({
        success: false,
        data: "Token not provided",
      });
      const response2 = await helper.get_request({
        endpoint: `user/get/${null}}`,
      });
      expect(response.body).toEqual({
        success: false,
        data: "Token not provided",
      });
      expect(response2.body).toEqual({
        success: false,
        data: "Token not provided",
      });
    });
    it("should return error if invalid id is passed in path params", async () => {
      const response = await helper.get_request_with_authorization({
        endpoint: `user/get/${null}`,
        token: tokens.superadmin,
      });
      logger.info(response.body);
      expect(response.body).toEqual({ success: false, data: "User not found" });
    });
    it("should return success if rights match and otherwise error with admin and super having all access", async () => {
      const allRoles = {
        superadmin: "superadmin",
        admin: "admin",
        testOperator: "testOperator",
        testCeo: "testCeo",
        zongCustomer: "zongCustomer",
      };
      const roles = {
        [allRoles.superadmin]: {
          token: tokens.superadmin,
          userInfo: jwt.decode(tokens.superadmin),
          canAccess: [
            allRoles.superadmin,
            allRoles.admin,
            allRoles.testOperator,
            allRoles.testCeo,
            allRoles.zongCustomer,
          ],
        },
        [allRoles.admin]: {
          token: tokens.admin,
          userInfo: jwt.decode(tokens.admin),
          canAccess: [
            allRoles.superadmin,
            allRoles.admin,
            allRoles.testOperator,
            allRoles.testCeo,
            allRoles.zongCustomer,
          ],
        },
        [allRoles.testOperator]: {
          token: tokens.testOperator,
          userInfo: jwt.decode(tokens.testOperator),
          canAccess: [allRoles.testOperator],
        },
        [allRoles.testCeo]: {
          token: tokens.ceo,
          userInfo: jwt.decode(tokens.ceo),
          canAccess: [allRoles.testOperator, allRoles.testCeo],
        },
        [allRoles.zongCustomer]: {
          token: tokens.zongCustomer,
          userInfo: jwt.decode(tokens.zongCustomer),
          canAccess: [allRoles.zongCustomer],
        },
      };
      /* eslint-disable no-unused-vars */
      for await (const [currentRole, { token, canAccess }] of Object.entries(
        roles,
      )) {
        for await (const [key, role] of Object.entries(allRoles)) {
          const response = await helper.get_request_with_authorization({
            endpoint: `user/get/${roles[role].userInfo.id}`,
            token: token,
          });
          const expectedResponse = canAccess.includes(role);
          expect(response.body.success).toEqual(expectedResponse);
        }
      }
      /* eslint-enable no-unused-vars */
    });
  });

  describe("/user/update/{userId}", () => {
    it("Should Resend invite if unregistered user's details are changed", async () => {
      const newName = "test";

      mailer.send = jest
        .fn()
        .mockImplementationOnce(async () => {
          return "Mocked response";
        })
        .mockImplementationOnce(async (options) => {
          const message = options.message;
          const nameIndexStart = message.indexOf("name=");
          const nameIndexStop = message.indexOf("&", nameIndexStart);
          expect(message.substring(nameIndexStart + 5, nameIndexStop)).toBe(
            newName,
          );

          return "Mocked response";
        });
      const data = {
        params: {
          orgId: Orgs.org1.id,
          role: "customer",
          email: "inviteuser@email.com",
        },
        token: tokens.superadmin,
        endpoint: "user/invite-user",
      };
      const user = await helper.post_request_with_authorization(data);
      const data2 = {
        params: {
          name: newName,
        },
        token: tokens.superadmin,
        endpoint: `user/update/${user.body.data.userId}`,
      };

      await helper.put_request_with_authorization(data2);
    });
  });

  describe("/user/recover-password-request", () => {
    it("Should fail to reset password if unregistered user", async () => {
      const data = {
        params: {
          orgId: Orgs.org1.id,
          role: "customer",
          email: "inviteuser@email.com",
        },
        token: tokens.superadmin,
        endpoint: "user/invite-user",
      };
      await helper.post_request_with_authorization(data);

      const data2 = {
        params: {
          email: "inviteuser@email.com",
        },
        token: tokens.superadmin,
        endpoint: "user/recover-password-request",
      };
      const response = await helper.post_request_with_authorization(data2);
      expect(response.body.data).toEqual("User not Registered");
    });
  });

  const phoneNumberOne = "+923175445369";
  const correctOTPCodeOne = "7924";
  const phoneNumberTwo = "+923175445368";

  describe("/user/login/otp", () => {
    beforeAll(() => {
      jest.spyOn(mainHelper, "send_sms").mockImplementation(
        jest.fn((otpCode) => {
          return Promise.resolve(otpCode);
        }),
      );

      jest.spyOn(mainHelper, "generate_random_string").mockImplementation(
        jest.fn(() => {
          return correctOTPCodeOne;
        }),
      );
    });

    it("Should send Otp to a user that is not registered and should save otp in the database", async () => {
      const data = {
        params: {
          phone: phoneNumberOne,
        },
        endpoint: "user/login/otp",
      };

      const { body } = await helper.post_request(data);
      const expectedResponse = {
        success: true,
        data: "Verification code sent",
      };
      const expectedOtpInDatabaseResponse = {
        id: 1,
        phone: "+923175445369",
        code: "7924",
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      const otpInDB = await getByPhone({
        phone: phoneNumberOne,
        code: correctOTPCodeOne,
      });

      expect(body).toEqual(expectedResponse);
      expect(otpInDB).toEqual(
        expect.objectContaining(expectedOtpInDatabaseResponse),
      );
    });

    it("Should send Otp to a user that is registered", async () => {
      const data = {
        params: {
          phone: phoneNumberTwo,
        },
        endpoint: "user/login/otp",
      };

      await helper.post_request(data);

      const dataVerify = {
        params: {
          phone: phoneNumberTwo,
          code: correctOTPCodeOne,
        },
        endpoint: "user/login/otp/verify",
      };
      await helper.post_request(dataVerify);

      const { body } = await helper.post_request(data);
      const expectedResponse = {
        success: true,
        data: "Verification code sent",
      };
      expect(body).toEqual(expectedResponse);
    });
  });

  describe("/user/login/otp/verify", () => {
    beforeAll(() => {
      jest.spyOn(mainHelper, "send_sms").mockImplementation(
        jest.fn((otpCode) => {
          return Promise.resolve(otpCode);
        }),
      );

      jest.spyOn(mainHelper, "generate_random_string").mockImplementation(
        jest.fn(() => {
          return correctOTPCodeOne;
        }),
      );
    });

    it("Should verify the sent otp and create access and refresh token", async () => {
      const data = {
        params: {
          phone: phoneNumberOne,
        },
        endpoint: "user/login/otp",
      };

      await helper.post_request(data);

      const dataVerify = {
        params: {
          phone: phoneNumberOne,
          code: correctOTPCodeOne,
        },
        endpoint: "user/login/otp/verify",
      };
      const { body } = await helper.post_request(dataVerify);

      const expectedResponse = {
        success: true,
        data: {
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        },
      };

      expect(body).toEqual(expectedResponse);
    });

    it("Should not verify already verified otps", async () => {
      const dataVerify = {
        params: {
          phone: phoneNumberOne,
          code: correctOTPCodeOne,
        },
        endpoint: "user/login/otp/verify",
      };
      const { body } = await helper.post_request(dataVerify);

      const expectedResponse = {
        success: false,
        data: "OTP not valid",
      };

      expect(body).toEqual(expectedResponse);
    });

    it("Should not verify the incorrect otp", async () => {
      const data = {
        params: {
          phone: phoneNumberOne,
        },
        endpoint: "user/login/otp",
      };

      await helper.post_request(data);

      const dataVerify = {
        params: {
          phone: phoneNumberOne,
          code: correctOTPCodeOne + "1232",
        },
        endpoint: "user/login/otp/verify",
      };
      const { body } = await helper.post_request(dataVerify);

      const expectedResponse = {
        success: false,
        data: "OTP not valid",
      };

      expect(body).toEqual(expectedResponse);
    });

    it("Should not verify expired otp", async () => {
      // WIP
    });
  });
});
