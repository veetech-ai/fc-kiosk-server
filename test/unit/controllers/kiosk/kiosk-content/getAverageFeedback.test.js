const helper = require("../../../../helper");
const product = require("../../../../../common/products");
const FeedbackService = require("../../../../../services/kiosk/feedback");
const { uuid } = require("uuidv4");

describe("PATCH /api/v1/course-feedbacks/{id}", () => {
  let adminToken;
  let courseId;
  let deviceId;
  let unlinkedDeviceToken;
  let deviceToken;
  let testOrganizationId = 1;
  let differentOrganizationCustomerToken;
  let customerToken;
  let productId = product.products.kiosk.id;
  let expectedAverageFeedback = 0;
  let feedbackSum = 0;
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
    {
      phone: "12312312",
      rating: 5,
      contact_medium: "call",
    },
  ];

  FeedbackParams.forEach((feedback) => {
    feedbackSum += feedback.rating;
  });
  expectedAverageFeedback = feedbackSum / FeedbackParams.length;
  expectedAverageFeedback = parseFloat(expectedAverageFeedback.toFixed(1));
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
    const unlinkeddeviceReqBody = {
      serial: uuid(),
      pin_code: 121,
      device_type: productId,
    };

    adminToken = await helper.get_token_for("admin");
    differentOrganizationCustomerToken = await helper.get_token_for(
      "zongCustomer",
    );
    customerToken = await helper.get_token_for("testCustomer");
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
    const unlinked_device_created =
      await helper.post_request_with_authorization({
        endpoint: "device/create",
        token: adminToken,
        params: unlinkeddeviceReqBody,
      });
    unlinkedDeviceToken =
      unlinked_device_created.body.data.device_token.split(" ")[1];
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
    const postMultipleFeedbcks = async () => {
      for (const feedbackParam of FeedbackParams) {
        feedbackParam.gcId = course.body.data.id;
        feedbackParam.orgId = course.body.data.orgId;
        await FeedbackService.createFeedback(feedbackParam);
      }
    };
    await postMultipleFeedbcks();
  });
  const makeApiRequest = async (token = deviceToken) => {
    return await helper.get_request_with_authorization({
      endpoint: `kiosk-content/averagefeedbacks`,
      token: token,
    });
  };

  it("should list the average feedback of the golf course", async () => {
    const expectedObject = {
      averageRating: expectedAverageFeedback,
      totalRating: FeedbackParams.length,
    };

    const response = await makeApiRequest();
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(expectedObject);
  });

  it("should return error if device is not linked with any course ", async () => {
    const response = await makeApiRequest(unlinkedDeviceToken);
    expect(response.body.success).toBe(false);
    expect(response.body.data).toBe("No Course linked with the device");
    expect(response.status).toBe(404);
  });

  it("should return error if the api is accessed by client other than device ", async () => {
    const response = await makeApiRequest(adminToken);
    expect(response.body.success).toBe(false);
    expect(response.body.data).toBe("Token invalid or expire");
  });
});
