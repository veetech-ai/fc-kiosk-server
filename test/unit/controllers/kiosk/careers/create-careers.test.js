const {
  organizationsInApplication,
} = require("../../../../../common/organizations.data");
const helper = require("../../../../helper");

const CareersServices = require("../../../../../services/kiosk/career");

let testCustomerToken,
  superAdminToken,
  testGolfCourseId,
  zongGolfCourseId,
  testOrganizatonId = organizationsInApplication.test.id,
  zongOrganizationId = organizationsInApplication.zong.id;

beforeAll(async () => {
  testCustomerToken = await helper.get_token_for("testCustomer");
  superAdminToken = await helper.get_token_for("superadmin");
});
let requestBody = {
  title: "Test Career",
  content: "<h2>Example Content</h2>",
  type: "Full Time",
  timings: '{"startTime": "10:00", "endTime": "16:00"}',
  link: "https://example.com",
};

describe("POST /careers", () => {
  const makeApiRequest = async (
    params,
    token = superAdminToken,
    endpoint = "careers",
  ) => {
    return helper.post_request_with_authorization({
      endpoint,
      token,
      params: params,
    });
  };
  beforeAll(async () => {
    // create golf courses

    const testGolfCourseCreationResponse = await makeApiRequest(
      {
        name: "TEST COURSE",
        orgId: testOrganizatonId,
        state: "Albama",
        city: "Abbeville",
      },
      superAdminToken,
      "kiosk-courses",
    );
    testGolfCourseId = testGolfCourseCreationResponse.body.data.id;

    const zongGolfCourseCreationResponse = await makeApiRequest(
      {
        name: "ZONG COURSE",
        orgId: zongOrganizationId,
        state: "Albama",
        city: "Abbeville",
      },
      superAdminToken,
      "kiosk-courses",
    );

    zongGolfCourseId = zongGolfCourseCreationResponse.body.data.id;
  });

  it("should return 400 and validation errors for the corresponding required fields", async () => {
    const expectedResponse = {
      success: false,
      data: {
        errors: {
          title: ["The title field is required."],
          gcId: ["The gcId field is required."],
          content: ["The content field is required."],
          type: ["The type field is required."],
        },
      },
    };

    const response = await makeApiRequest({});

    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(400);
  });

  it("should return 400 and data type validation errors for the required fields", async () => {
    const expectedResponse = {
      success: false,
      data: {
        errors: {
          title: ["The title must be a string."],
          gcId: ["The gcId must be an integer."],
          content: ["The content must be a string."],
          type: ["The type must be a string."],
          timings: ["The timings must be a JSON string."],
        },
      },
    };
    const requestBodyClone = {
      title: 1,
      gcId: "a",
      content: 2,
      type: 123,
      timings: "INVALID JSON FORMAT",
    };
    const response = await makeApiRequest(requestBodyClone, superAdminToken);

    expect(response.statusCode).toBe(400);
    expect(response.body).toStrictEqual(expectedResponse);
  });

  it("should return error if link is not of URL type", async () => {
    const expectedResponse = {
      success: false,
      data: "Validation error: Validation isUrl on link failed",
    };
    const requestBodyClone = {
      ...requestBody,
      gcId: testGolfCourseId,
      link: "example",
    };
    const response = await makeApiRequest(requestBodyClone);

    expect(response.body).toStrictEqual(expectedResponse);
  });

  it("should return an error if a customer tries to add career to the golf course that does not belong to his organization", async () => {
    const expectedResponse = {
      success: false,
      data: "Course not found",
    };
    const requestBodyClone = { ...requestBody, gcId: zongGolfCourseId };
    const response = await makeApiRequest(requestBodyClone, testCustomerToken);

    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(404);
  });

  it("should create career under the test customer's organization's golf course", async () => {
    const expectedResponse = {
      title: "Test Career",
      content: "<h2>Example Content</h2>",
      type: "Full Time",
      timings: { startTime: "10:00", endTime: "16:00" },
      link: "https://example.com",
      gcId: testGolfCourseId,
      orgId: testOrganizatonId,
    };
    const requestBodyClone = { ...requestBody, gcId: testGolfCourseId };
    const response = await makeApiRequest(requestBodyClone, testCustomerToken);

    await CareersServices.deleteCareersWhere({ id: response.body.data.id });

    expect(response.body.data).toEqual(
      expect.objectContaining(expectedResponse),
    );
    expect(response.body.success).toBe(true);
    expect(response.statusCode).toBe(200);
  });

  it("should return an error if the specified golf course does not exist in case of the super admin", async () => {
    const expectedResponse = {
      success: false,
      data: "Course not found",
    };
    const requestBodyClone = { ...requestBody, gcId: -1 };
    const response = await makeApiRequest(requestBodyClone, superAdminToken);

    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(404);
  });

  it("should create career if the super admin tries to create the career under any existing golf course", async () => {
    const expectedResponse = {
      title: "Test Career",
      content: "<h2>Example Content</h2>",
      type: "Full Time",
      timings: { startTime: "10:00", endTime: "16:00" },
      link: "https://example.com",
      gcId: zongGolfCourseId,
      orgId: zongOrganizationId,
    };
    const requestBodyClone = { ...requestBody, gcId: zongGolfCourseId };
    const response = await makeApiRequest(requestBodyClone, superAdminToken);
    await CareersServices.deleteCareersWhere({ id: response.body.data.id });

    expect(response.body.data).toEqual(
      expect.objectContaining(expectedResponse),
    );
    expect(response.body.success).toBe(true);
    expect(response.statusCode).toBe(200);
  });
});
