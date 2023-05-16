const helper = require("../../../../helper");
const models = require("../../../../../models/index");
const product = require("../../../../../common/products");
const { uuid } = require("uuidv4");
const Course = models.Course;
describe("GET /api/v1/kiosk-content/screens", () => {
  let adminToken;
  let courseId;
  let deviceId;
  let deviceToken;
  let testOrganizationId = 1;
  const expected = {
    courseInfo: true,
    coupons: true,
    lessons: true,
    statistics: true,
    memberships: true,
    feedback: true,
    careers: true,
    shop: true,
    faq: true,
  };
  let productId = product.products.kiosk.id;
  beforeAll(async () => {
    // Create some courses for the test organization
    const courses = {
      name: "Course 1",
      city: "Test City 1",
      state: "Test State 1",
      orgId: testOrganizationId,
    };
    const bodyData = {
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
    const device_created = await helper.post_request_with_authorization({
      endpoint: "device/create",
      token: adminToken,
      params: bodyData,
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
    return await helper.get_request_with_authorization({
      endpoint: `kiosk-content/screens`,
      token: token,
    });
  };

  it("should successfully list screens configurtaion related to device", async () => {
    const response = await makeApiRequest();
    expect(response.body.data).toMatchObject(expected);
  });
  it("returns 403 status code Request", async () => {
    const response = await makeApiRequest({}, adminToken);
    expect(response.body.data).toEqual("Token invalid or expire");
    expect(response.status).toEqual(403);
  });
});
