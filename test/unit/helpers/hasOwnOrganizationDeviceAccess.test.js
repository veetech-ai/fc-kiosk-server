const { hasOwnOrganizationDeviceAccess } = require("../../../common/helper");
const helper = require("../../helper");
const models = require("../../../models");
const Device = models.Device;
const OrganizationDevice = models.Organization_Device;
const { uuid } = require("uuidv4");
const { products } = require("../../../common/products");

const mockRequest = (role = "super admin", orgId = null) => {
  const req = {};
  req.user = {
    role: { title: role },
    orgId: orgId,
  };
  return req;
};
const notLoggedInMockRequest = () => {
  const req = {};
  return req;
};
const userWithoutRoleMockRequest = () => {
  const req = {};
  req.user = {};
  return req;
};
const userWithNonExistentRoleMockRequest = () => {
  const req = {};
  req.user = {
    role: { title: "role that does not exist" },
  };
  return req;
};

const createDeviceForOtherOrganization = async (token, orgId = 4) => {
  const device = await helper.post_request_with_authorization({
    endpoint: "device/create",
    params: {
      serial: uuid(),
      pin_code: "1111",
      device_type: products.kiosk.id,
    },
    token: token,
  });
  await Device.update(
    { owner_id: orgId },
    { where: { id: device.body.data.id } },
  );
  await OrganizationDevice.update(
    { orgId: orgId },
    {
      where: {
        device_id: device.body.data.id,
        orgId: device.body.data.owner_id,
      },
    },
  );
  return device.body;
};

const getDeviceForUserOrganization = async (token, orgId = 4) => {
  const device = await helper.post_request_with_authorization({
    endpoint: "device/create",
    params: {
      serial: uuid(),
      pin_code: "1111",
      device_type: products.kiosk.id,
    },
    token: token,
  });
  return device.body.data;
};

describe("hasOwnOrganizationDeviceAccess helper function test", () => {
  let mockedRequests, otherOrgDevice, token, sameOrgDevice;
  beforeAll(async () => {
    mockedRequests = {
      notLoggedIn: notLoggedInMockRequest(),
      userWithoutRole: userWithoutRoleMockRequest(),
      userWithNonExistentRoleMockRequest: userWithNonExistentRoleMockRequest(),
      superAdmin: mockRequest("super admin"),
      admin: mockRequest("admin"),
      customer: mockRequest("customer", 1),
      operator: mockRequest("operator", 1),
      basic: mockRequest("basic"),
    };
    token = await helper.get_token_for("superadmin");
    otherOrgDevice = await createDeviceForOtherOrganization(token);
    sameOrgDevice = await getDeviceForUserOrganization(token);
  });

  describe("Error cases", () => {
    const invalidCasesDeviceId = -1;
    const errorCasesDeviceId = 2;
    test("if it returns an error if user not logged in", async () => {
      const { success, message } = await hasOwnOrganizationDeviceAccess(
        mockedRequests.notLoggedIn,
        errorCasesDeviceId,
      );
      expect({ success, message }).toStrictEqual({
        success: false,
        message: "Token not provided",
      });
    });
    test("if it returns an error if user role does not exist in the database", async () => {
      const { success, message } = await hasOwnOrganizationDeviceAccess(
        mockedRequests.userWithNonExistentRoleMockRequest,
        errorCasesDeviceId,
      );
      expect({ success, message }).toStrictEqual({
        success: false,
        message: "Role not found",
      });
    });
    test("it it  returns an error if user has no role", async () => {
      const { success, message } = await hasOwnOrganizationDeviceAccess(
        mockedRequests.userWithoutRole,
        errorCasesDeviceId,
      );
      expect({ success, message }).toStrictEqual({
        success: false,
        message: "Role not found",
      });
    });
    test("if it returns an error if device doesnot exist", async () => {
      const { success, message } = await hasOwnOrganizationDeviceAccess(
        mockedRequests.customer,
        invalidCasesDeviceId,
      );
      expect({ success, message }).toStrictEqual({
        success: false,
        message: "Device not found",
      });
    });
    test("if it returns an  error if device owner id is not the same the user org id", async () => {
      const { success, message } = await hasOwnOrganizationDeviceAccess(
        mockedRequests.customer,
        otherOrgDevice.data.id,
      );
      expect({ success, message }).toStrictEqual({
        success: false,
        message: "The device does not belong to your organization",
      });
    });
    test("should return error if user does not have required role rights even if the device belongs to user's organisation", async () => {
      const { success, message } = await hasOwnOrganizationDeviceAccess(
        mockedRequests.operator,
        errorCasesDeviceId,
        ["manageDevices"],
      );
      expect({ success, message }).toStrictEqual({
        success: false,
        message: "Unauthorized to perform the action",
      });
    });
  });

  describe("Success cases", () => {
    test("if it returns  success if user is super admin", async () => {
      const { success, message } = await hasOwnOrganizationDeviceAccess(
        mockedRequests.superAdmin,
        sameOrgDevice.id,
      );
      expect({ success, message }).toStrictEqual({
        success: true,
        message: "Allowed",
      });
    });
    test("it should return success if user is admin", async () => {
      const { success, message } = await hasOwnOrganizationDeviceAccess(
        mockedRequests.admin,
        sameOrgDevice.id,
      );
      expect({ success, message }).toStrictEqual({
        success: true,
        message: "Allowed",
      });
    });
    test("if it returns success if device owner id is same as the user org id", async () => {
      const { success, message } = await hasOwnOrganizationDeviceAccess(
        mockedRequests.customer,
        sameOrgDevice.id,
      );
      expect({ success, message }).toStrictEqual({
        success: true,
        message: "Allowed",
      });
    });
    test("if it returns success if user has required role right and device belongs to user's organization", async () => {
      const { success, message } = await hasOwnOrganizationDeviceAccess(
        mockedRequests.operator,
        sameOrgDevice.id,
        ["getDevices"],
      );
      expect({ success, message }).toStrictEqual({
        success: true,
        message: "Allowed",
      });
    });
  });
});
