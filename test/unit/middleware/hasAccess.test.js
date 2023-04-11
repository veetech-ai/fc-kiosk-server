const { hasOwnUserInformationAccess } = require("../../../common/helper");

const mockRequest = (role = "super admin", orgId = null) => {
  const req = {};
  req.user = {
    id: 1,
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

describe("hasOwnUserInformationAccess helper function test", () => {
  let mockedRequests, customerUserId, differentOrgUserId, userId;
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
    customerUserId = 1;
    differentOrgUserId = 4;
    userId = 2;
  });

  describe("Error cases", () => {
    test("should return error if user not logged in", async () => {
      const { success, message } = await hasOwnUserInformationAccess(
        mockedRequests.notLoggedIn,
        customerUserId,
      );
      expect({ success, message }).toStrictEqual({
        success: false,
        message: "Token not provided",
      });
    });
    test("should return error if user role does not exist in the database", async () => {
      const { success, message } = await hasOwnUserInformationAccess(
        mockedRequests.userWithNonExistentRoleMockRequest,
        customerUserId,
      );
      expect({ success, message }).toStrictEqual({
        success: false,
        message: "Role not found",
      });
    });
    test("should return error if user has no role", async () => {
      const { success, message } = await hasOwnUserInformationAccess(
        mockedRequests.userWithoutRole,
        userId,
      );
      expect({ success, message }).toStrictEqual({
        success: false,
        message: "Role not found",
      });
    });
    test("should return error if user id is not the same as the requested user id", async () => {
      const { success, message } = await hasOwnUserInformationAccess(
        mockedRequests.customer,
        differentOrgUserId,
      );
      expect({ success, message }).toStrictEqual({
        success: false,
        message: "You are not allowed",
      });
    });
    test("should return error if user does not have required role right even if the user is requesting their own information", async () => {
      const { success, message } = await hasOwnUserInformationAccess(
        mockedRequests.operator,
        customerUserId,
        ["manageUsers"],
      );
      expect({ success, message }).toStrictEqual({
        success: false,
        message: "Unauthorized to perform the action",
      });
    });
  });

  describe("Success cases", () => {
    test("should return success if user is super admin", async () => {
      const { success, message } = await hasOwnUserInformationAccess(
        mockedRequests.superAdmin,
        userId,
      );
      expect({ success, message }).toStrictEqual({
        success: true,
        message: "Allowed",
      });
    });
    test("should return success if user is admin", async () => {
      const { success, message } = await hasOwnUserInformationAccess(
        mockedRequests.admin,
        userId,
      );
      expect({ success, message }).toStrictEqual({
        success: true,
        message: "Allowed",
      });
    });
    test("should return success if user id is same as the requested user id", async () => {
      const { success, message } = await hasOwnUserInformationAccess(
        mockedRequests.customer,
        customerUserId,
      );
      expect({ success, message }).toStrictEqual({
        success: true,
        message: "Allowed",
      });
    });
    test("should return success if user has required role right and his id is the same as the requested user id", async () => {
      const { success, message } = await hasOwnUserInformationAccess(
        mockedRequests.customer,
        customerUserId,
        ["getUsers"],
      );
      expect({ success, message }).toStrictEqual({
        success: true,
        message: "Allowed",
      });
    });
  });
});
