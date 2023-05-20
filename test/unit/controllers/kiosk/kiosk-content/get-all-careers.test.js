const {
  organizationsInApplication,
} = require("../../../../../common/organizations.data");
const product = require("../../../../../common/products");

const helper = require("../../../../helper");
const { uuid } = require("uuidv4");
const DevicesServices = require("../../../../../services/device");

let superAdminToken,
  testOrganizationDeviceToken,
  testOrganizatonId = organizationsInApplication.test.id,
  zongOrganizationId = organizationsInApplication.zong.id,
  testOrganizationDeviceId,
  course = {};

beforeAll(async () => {
  superAdminToken = await helper.get_token_for("superadmin");
});

describe("GET /kiosk-content/careers - Get all careers", () => {
  const makeApiRequest = async (
    queryParams,
    token = testOrganizationDeviceToken,
    endpoint = "kiosk-content/careers", // redeem coupon
  ) => {
    return helper.get_request_with_authorization({
      endpoint,
      token,
      queryParams,
    });
  };

  const createGolfCourse = async (params, token = superAdminToken) => {
    const linkedDevice = await helper.post_request_with_authorization({
      endpoint: `kiosk-courses`,
      params,
      token: token,
    });

    return linkedDevice;
  };

  const createDevice = async (params, token = superAdminToken) => {
    const device = await helper.post_request_with_authorization({
      endpoint: `device/create`,
      params,
      token: token,
    });

    return device;
  };

  const createCareers = async (params, token = superAdminToken) => {
    const career = await helper.post_request_with_authorization({
      endpoint: "careers",
      params,
      token: token,
    });

    return career?.body?.data;
  };

  beforeAll(async () => {
    // Create golf courses
    const testGolfCourseCreationResponse = await createGolfCourse({
      name: "TEST COURSE",
      orgId: testOrganizatonId,
      state: "Albama",
      city: "Abbeville",
    });
    course.testGolfCourseId = testGolfCourseCreationResponse.body.data.id;

    const zongGolfCourseCreationResponse = await createGolfCourse({
      name: "ZONG COURSE",
      orgId: zongOrganizationId,
      state: "Albama",
      city: "Abbeville",
    });
    course.zongGolfCourseId = zongGolfCourseCreationResponse.body.data.id;

    // Create a device under test organization
    const testOrganizationDevice = await createDevice({
      serial: uuid(),
      pin_code: 1111,
      device_type: product.products.kiosk.id,
    });

    testOrganizationDeviceId = testOrganizationDevice.body.data.id;
    testOrganizationDeviceToken =
      testOrganizationDevice?.body?.data?.device_token.split(" ")[1];

    // Create careers
    for await (const gcId of Object.values(course)) {
      await createCareers({
        gcId,
        title: `Test Career ${gcId}`,
        content: "<h2>Example Content</h2>",
        type: "Full Time",
        timings: '{"startTime": "10:00", "endTime": "16:00"}',
        link: "https://example.com",
      });
    }
  });

  it("should return an error if the device is not yet linked with any golf course", async () => {
    const expectedResponse = {
      success: false,
      data: "No Course linked with the device",
    };

    // To make sure that the device is not linked with the course, we would call a service to unlink in case it is already linked
    await DevicesServices.update(testOrganizationDeviceId, { gcId: null });
    const response = await makeApiRequest();
    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toEqual(404);
  });

  it("should only return the test organization's golf course's careers", async () => {
    // Link the device with the golf course
    await DevicesServices.update(testOrganizationDeviceId, {
      gcId: course.testGolfCourseId,
    });

    const expectedResponse = {
      gcId: course.testGolfCourseId,
      content: "<h2>Example Content</h2>",
      title: `Test Career ${course.testGolfCourseId}`,
      type: "Full Time",
      timings: { startTime: "10:00", endTime: "16:00" },
      link: "https://example.com",
    };

    const response = await makeApiRequest();

    // unlink the device again
    await DevicesServices.update(testOrganizationDeviceId, { gcId: null });

    expect(response.body.data).toEqual(
      expect.arrayContaining([expect.objectContaining(expectedResponse)]),
    );
    expect(response.body.success).toEqual(true);
    expect(response.statusCode).toEqual(200);
  });
});
