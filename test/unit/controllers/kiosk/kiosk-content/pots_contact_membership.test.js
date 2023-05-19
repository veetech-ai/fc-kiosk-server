const helper = require("../../../../helper");
const models = require("../../../../../models/index");
const product = require("../../../../../common/products");
const { uuid } = require("uuidv4");
const membershipService = require("../../../../../services/kiosk/membership");

describe("POST /api/v1/kiosk-content/memberships/contacts", () => {
  let adminToken;
  let courseId;
  let deviceId;
  let deviceToken;
  let testOrganizationId = 1;
  let productId = product.products.kiosk.id;
  let membershipId;

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
  });

  const makeApiRequest = async (params, token = deviceToken) => {
    return await helper.post_request_with_authorization({
      endpoint: `kiosk-content/memberships/contacts`,
      token: token,
      params: params,
    });
  };

  it("should throw validation error for invalid reqBody", async () => {
    const reqBody = {
      userPhone: "43423423",
      contact_medium: "text",
    };
    const response = await makeApiRequest(reqBody);
    expect(response.body.data.errors).toEqual({
      membershipId: ["The membershipId field is required."],
    });
  });
  it("should successfully create a contact request for membership", async () => {
    const reqBody = {
      membershipId: membershipId,
      userPhone: "43423423",
      contact_medium: "text",
    };
    const response = await makeApiRequest(reqBody);
    expect(response.body.data.mId).toEqual(reqBody.membershipId);
    expect(response.body.data.contactMedium).toEqual(reqBody.contact_medium);
    expect(response.body.data.userPhone).toEqual(reqBody.phoneNumber);
  });
  it("returns 403 status code Request", async () => {
    const response = await makeApiRequest({}, adminToken);
    expect(response.body.data).toEqual("Token invalid or expire");
  });
});
