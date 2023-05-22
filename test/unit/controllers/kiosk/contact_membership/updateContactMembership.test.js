const helper = require("../../../../helper");
const models = require("../../../../../models/index");
const product = require("../../../../../common/products");
const { uuid } = require("uuidv4");
const membershipService = require("../../../../../services/kiosk/membership");

describe("PATCH /api/v1/course-membership/contacts/{id}", () => {
  let adminToken;
  let courseId;
  let deviceId;
  let deviceToken;
  let customerToken;
  let testOrganizationId = 1;
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

  const makeApiRequest = async (id, body, token = adminToken) => {
    return await helper.patch_request_with_authorization({
      endpoint: `course-membership/contacts/${id}`,
      token: token,
      params: body,
    });
  };

  it("should successfully update contact membership", async () => {
    const body = {
      isAddressed: true,
    };
    const response = await makeApiRequest(membershipId, body);
    expect(response.body.data).toBe("Updated Successfully");
  });
  it("should successfully update contact membership when api is accessed by customer same orgnaization", async () => {
    const body = {
      isAddressed: true,
    };
    const response = await makeApiRequest(membershipId, body, customerToken);
    expect(response.body.data).toBe("Updated Successfully");
  });
  it("should return validation error if non boolean value is passed", async () => {
    const body = {
      isAddressed: null,
    };
    const response = await makeApiRequest(membershipId, body, customerToken);
    expect(response.body.data).toBe("isAddressed must be a boolean");
  });
  it("should return error while the api is being accessed by the customer of different organization", async () => {
    const body = {
      isAddressed: true,
    };
    const response = await makeApiRequest(
      membershipId,
      body,
      differentOrganizationCustomerToken,
    );
    expect(response.body.data).toEqual("You are not allowed");
  });
});
