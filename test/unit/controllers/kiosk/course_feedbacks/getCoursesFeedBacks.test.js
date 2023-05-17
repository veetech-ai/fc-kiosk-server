const helper = require("../../../../helper");
const models = require("../../../../../models/index");
const product = require("../../../../../common/products");
const { uuid } = require("uuidv4");

describe("GET /api/v1/kiosk-content/screens", () => {
  let adminToken;
  let courseId;
  let deviceId;
  let deviceToken;
  let testOrganizationId = 1;
  let productId = product.products.kiosk.id;

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
    const FeedbackParams =[ {
        phoneNumber: "12312312",
        rating: 3,
        contact_medium: 12,
      },
      {
        phoneNumber: "12312312",
        rating: 4,
        contact_medium: 12,
      }
    ]
  });

  const makeApiRequest = async (params, token = deviceToken) => {
    return await helper.post_request_with_authorization({
      endpoint: `kiosk-content/feedback`,
      token: token,
      params: params,
    });
  };

  it("should successfully return registered feedback with valid input", async () => {
    const reqBody = {
      phoneNumber: "",
      rating: 3,
      contact_medium: "text",
    };
    const response = await makeApiRequest(reqBody);
    expect(response.body.data.rating).toEqual(reqBody.rating);
    expect(response.body.data.contact_medium).toEqual(reqBody.contact_medium);
    expect(response.body.data.phoneNumber).toEqual(undefined);
  });
  it("should return validation error invalid input", async () => {
    const reqBody = {
      phoneNumber: "12312312",
      rating: 3,
      contact_medium: 12,
    };
    const response = await makeApiRequest(reqBody);
    expect(response.body.data.errors).toEqual({
      contact_medium: ["The contact medium must be a string."],
    });
  });
  it("returns 403 status code Request", async () => {
    const response = await makeApiRequest({}, adminToken);
    expect(response.body.data).toEqual("Token invalid or expire");
  });
});
