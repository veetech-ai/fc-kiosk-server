const helper = require("../../../../helper");
const models = require("../../../../../models/index");
const product = require("../../../../../common/products");
const { uuid } = require("uuidv4");
const { async } = require("crypto-random-string");

describe("GET /api/v1/course-feedback/courses/${gcId}", () => {
  let adminToken;
  let courseId;
  let deviceId;
  let deviceToken;
  let testOrganizationId = 1;
  let differentOrganizationCustomerToken;
  let productId = product.products.kiosk.id;
  const FeedbackParams = [
    {
      phone: "12312312",
      rating: 3,
      contact_medium: "text",
    },
    {
      phone: "12312312",
      rating: 4,
      contact_medium: "call",
    },
  ];
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
    differentOrganizationCustomerToken = await helper.get_token_for(
      "zongCustomer",
    );
    const course = await helper.post_request_with_authorization({
      endpoint: "kiosk-courses",
      token: adminToken,
      params: courses,
    });
    courseId = course.body.data.id;
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
    const postMultipleFeedbacks = async () => {
      for (const feedbackParam of FeedbackParams) {
        await helper.post_request_with_authorization({
          endpoint: `kiosk-content/feedbacks`,
          token: deviceToken,
          params: feedbackParam,
        });
      }
    };
    await postMultipleFeedbacks();
  });
  const makeApiRequest = async (gcId, token = adminToken) => {
    return await helper.get_request_with_authorization({
      endpoint: `course-feedback/courses/${gcId}`,
      token: token,
    });
  };

  it("should successfully return registered feedback with valid input", async () => {
 
    const response = await makeApiRequest(courseId);
    expect(response.body.data).toEqual(expect.objectContaining({
      feedbacks: expect.any(Array),
      summary: expect.any(Object)
    }))
  });

  it("should return validation error invalid input", async () => {
    const response = await makeApiRequest();

    expect(response.body.data).toEqual("courseId must be a valid number");
  });

  it("should return error while the api is being accessed by the customer of different organization", async () => {
    const response = await makeApiRequest(
      courseId,
      differentOrganizationCustomerToken,
    );
    expect(response.body.data).toEqual("You are not allowed");
  });
});
