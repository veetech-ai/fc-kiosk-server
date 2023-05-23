const helper = require("../../../helper");
const models = require("../../../../models/index");
const { uuid } = require("uuidv4");
const Course = models.Course;
describe("PUT /api/v1/device/link-golf-course/{id}", () => {
  let adminToken;
  let customerToken;
  let testOperatorToken;
  let differentOrganizationCustomerToken;
  let testOrganizationId = 1;
  let courseId;
  let deviceId;
  let invalidCourseId = 90000000;
  let invalidDeviceId = 90000000;

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
      device_type: 1,
    };

    adminToken = await helper.get_token_for("admin");
    customerToken = await helper.get_token_for("testCustomer");
    testOperatorToken = await helper.get_token_for("testOperator");
    differentOrganizationCustomerToken = await helper.get_token_for(
      "zongCustomer",
    );
    const course = await helper.post_request_with_authorization({
      endpoint: "kiosk-courses",
      token: adminToken,
      params: courses,
    });
    courseId = course.body.data.id;
    const device = await helper.post_request_with_authorization({
      endpoint: "device/create",
      token: adminToken,
      params: bodyData,
    });
    deviceId = device.body.data.id;
  });

  const makeApiRequest = async (deviceId, courseId, token = adminToken) => {
    const deviceIdString = deviceId.toString();
    const courseIdString = courseId.toString();

    return await helper.put_request_with_authorization({
      endpoint: `device/${deviceIdString}/courses/${courseIdString}/link`,
      params: {},
      token: token,
    });
  };

  it("should successfully link the device with golf course", async () => {
    const response = await makeApiRequest(deviceId, courseId);
    expect(response.body.data.gcId).toBe(courseId);
  });
  it.only("returns 200 status code Request with expected message for an invalid device ID", async () => {
    const response = await makeApiRequest(invalidDeviceId, courseId);
    expect(response.body.data).toEqual("Device not found");
  });
  it("returns 200 status code Request with expected message for an invalid course ID", async () => {
    const response = await makeApiRequest(deviceId, invalidCourseId);
    expect(response.body.data).toEqual("Course not found");
    expect(response.status).toEqual(200);
  });
  it("ensure that organization customer can get screen details for the course belongs to same organization ", async () => {
    const response = await makeApiRequest(deviceId, courseId, customerToken);
    expect(response.body.data.gcId).toBe(courseId);
  });
  it("returns validation error for an invalid device ID", async () => {
    const response = await makeApiRequest("aa", courseId);
    expect(response.body.data).toEqual(
      "deviceId and courseId must be a valid number",
    );
  });
  it("should return an error if user belongs to same organization but do not have proper rights is not authorized", async () => {
    const response = await makeApiRequest(
      deviceId,
      courseId,
      testOperatorToken,
    );
    expect(response.body.data).toEqual("You are not allowed");
  });

  it("should return an error if user belongs to different organization", async () => {
    const response = await makeApiRequest(
      deviceId,
      courseId,
      differentOrganizationCustomerToken,
    );
    expect(response.body.data).toEqual("You are not allowed");
  });
});
