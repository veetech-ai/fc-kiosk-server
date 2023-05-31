const helper = require("../../../../helper");
const product = require("../../../../../common/products");
const {
  organizationsInApplication,
} = require("../../../../../common/organizations.data");
const { uuid } = require("uuidv4");
const membershipService = require("../../../../../services/kiosk/membership");

describe("GET /api/v1/course-membersip/{id}/contacts", () => {
  let adminToken;
  let courseId;
  let deviceId;
  let deviceToken;
  let customerToken;
  let testOrganizationId = organizationsInApplication.test.id;
  let differentOrganizationCustomerToken;
  let productId = product.products.kiosk.id;
  let membershipId;
  const reqBody = {
    phone: "43423423",
    contact_medium: "text",
  };

  beforeAll(async () => {
    // Create some courses for the test organization
    const courses = {
      name: "Course 1",
      city: "Test City 1",
      state: "Test State 1",
      orgId: testOrganizationId,
    };
    const deviceReqBody = {
      serial: uuid(),
      pin_code: 1111,
      device_type: productId,
    };

    adminToken = await helper.get_token_for("admin");
    customerToken = await helper.get_token_for("testCustomer");
    differentOrganizationCustomerToken = await helper.get_token_for(
      "zongCustomer",
    );
    const course = await helper.post_request_with_authorization({
      endpoint: "kiosk-courses",
      token: adminToken,
      params: courses,
    });
    courseId = course.body.data.id;
    const membership_created = await membershipService.getMembershipByCourseId(
      courseId,
    );
    membershipId = membership_created.id;
    const device_created = await helper.post_request_with_authorization({
      endpoint: "device/create",
      token: adminToken,
      params: deviceReqBody,
    });
    deviceId = device_created.body.data.id;
    await helper.put_request_with_authorization({
      endpoint: `device/${deviceId}/courses/${courseId}/link`,
      params: {},
      token: adminToken,
    });
    const device = await helper.get_request_with_authorization({
      endpoint: `device/${deviceId}`,
      token: adminToken,
    });
    deviceToken = device.body.data.Device.device_token.split(" ")[1];
    await helper.post_request_with_authorization({
      endpoint: `kiosk-content/memberships/contacts`,
      token: deviceToken,
      params: { membershipId, ...reqBody },
    });
  });

  const makeApiRequest = async (id, token = adminToken) => {
    return await helper.get_request_with_authorization({
      endpoint: `course-membership/${id}/contacts`,
      token: token,
    });
  };

  it("should successfully return contact membership list", async () => {
    const expectedResponse = {
      userPhone: reqBody.phone,
      userEmail: null,
      contactMedium: "text",
      isAddressed: false,
    };
    const response = await makeApiRequest(membershipId);
    expect(response.body.data).toEqual(
      expect.arrayContaining([expect.objectContaining(expectedResponse)]),
    );
  });
  it("should successfully return contact membership list with user of same orgnaization", async () => {
    const expectedResponse = {
      userPhone: reqBody.phone,
      userEmail: null,
      contactMedium: "text",
      isAddressed: false,
    };
    const response = await makeApiRequest(membershipId, customerToken);
    expect(response.body.data).toEqual(
      expect.arrayContaining([expect.objectContaining(expectedResponse)]),
    );
  });
  it("should return error while the api is being accessed by the customer of different organization", async () => {
    const response = await makeApiRequest(
      membershipId,
      differentOrganizationCustomerToken,
    );
    expect(response.body.data).toEqual("Not found");
  });
});
