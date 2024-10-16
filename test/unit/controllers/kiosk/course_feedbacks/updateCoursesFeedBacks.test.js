const helper = require("../../../../helper");
const product = require("../../../../../common/products");
const { uuid } = require("uuidv4");

describe("PATCH /api/v1/course-feedbacks/{id}", () => {
  let adminToken;
  let courseId;
  let deviceId;
  let deviceToken;
  let testOrganizationId = 1;
  let differentOrganizationCustomerToken;
  let customerToken;
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
  let feedBackId;
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
        return await helper.post_request_with_authorization({
          endpoint: `kiosk-content/feedbacks`,
          token: deviceToken,
          params: feedbackParam,
        });
      }
    };
    const response = await postMultipleFeedbcks();
    feedBackId = response.body.data.id;
  });
  const makeApiRequest = async (id, reqBody, token = adminToken) => {
    return await helper.patch_request_with_authorization({
      endpoint: `course-feedback/${id}`,
      token: token,
      params: reqBody,
    });
  };

  it("should successfully update with valid input", async () => {
    const reqBody = {
      isAddressed: true,
    };

    const response = await makeApiRequest(feedBackId, reqBody);
    expect(response.body.data).toBe(1);

    await makeApiRequest(feedBackId, { isAddressed: false });
  });

  it("should update the record when api is accessed by the customer of same organization", async () => {
    const reqBody = {
      isAddressed: true,
    };

    const response = await makeApiRequest(feedBackId, reqBody, customerToken);
    expect(response.body.data).toBe(1);

    await makeApiRequest(feedBackId, { isAddressed: false }, customerToken);
  });
  it("should return error while the api is being accessed by the customer of differnet organization", async () => {
    const reqBody = {
      isAddressed: true,
    };

    const response = await makeApiRequest(
      feedBackId,
      reqBody,
      differentOrganizationCustomerToken,
    );
    expect(response.body.data).toBe("You are not allowed");
  });
});
