const {
  organizationsInApplication,
} = require("../../../../../common/organizations.data");
const product = require("../../../../../common/products");

const helper = require("../../../../helper");
const { uuid } = require("uuidv4");
const DevicesServices = require("../../../../../services/device");
const CoursesServices = require("../../../../../services/kiosk/course");
const CareersServices = require("../../../../../services/kiosk/career");

let superAdminToken,
  testOrganizationDeviceToken,
  testOrganizatonId = organizationsInApplication.test.id,
  testOrganizationDeviceId,
  testGolfCourseId,
  testCareerId;

beforeAll(async () => {
  superAdminToken = await helper.get_token_for("superadmin");
});

afterAll(async () => {
  await CoursesServices.deleteWhere({ id: testGolfCourseId })
  await CareersServices.deleteWhere({ id: testCareerId })
});

describe("POST /kiosk-content/careers/contacts - Create contact request", () => {
  const makeApiRequest = async (
    params,
    token = testOrganizationDeviceToken,
    endpoint = "kiosk-content/careers/contacts", // redeem coupon
  ) => {
    return helper.post_request_with_authorization({
      endpoint,
      token,
      params,
    });
  };

  const createGolfCourse = async (params, token = superAdminToken) => {
    const createdGolfCourse = await helper.post_request_with_authorization({
      endpoint: `kiosk-courses`,
      params,
      token: token,
    });

    return createdGolfCourse.body.data;
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
    const course = await createGolfCourse({
      name: "TEST COURSE",
      orgId: testOrganizatonId,
      state: "Albama",
      city: "Abbeville",
    });
    testGolfCourseId = course.id;

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
    const career = await createCareers({
      gcId: testGolfCourseId,
      title: "Test Career",
      content: "<h2>Example Content</h2>",
      type: "Full Time",
      timings: '{"startTime": "10:00", "endTime": "16:00"}',
      link: "https://example.com",
    });
    testCareerId = career.id;

    await DevicesServices.update(testOrganizationDeviceId, {
      gcId: testGolfCourseId,
    }); // link device with a golf course
  });

  it("should return 400 and validation errors for the corresponding required fields", async () => {
    const expectedResponse = {
      success: false,
      data: {
        errors: {
          careerId: ["The careerId field is required."],
        },
      },
    };

    const response = await makeApiRequest({});
    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(400);
  });

  it("should return 400 and data type validation error for the career id if invalid type value is sent", async () => {
    const expectedResponse = {
      success: false,
      data: {
        errors: {
          careerId: ["The careerId must be an integer."],
        },
      },
    };

    const response = await makeApiRequest({ careerId: "abc" });

    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(400);
  });

  it("should return 400 and validation error for the contactMedium if value other than text or call is being sent", async () => {
    const expectedResponse = {
      success: false,
      data: {
        errors: {
          contactMedium: ["The selected contactMedium is invalid."],
        },
      },
    };

    const response = await makeApiRequest({
      careerId: testCareerId,
      contactMedium: "abc",
    });

    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(400);
  });

  it("should return 400 and validation error incorrect email format is used", async () => {
    const expectedResponse = {
      success: false,
      data: {
        errors: {
          email: ["The email format is invalid."],
        },
      },
    };

    const response = await makeApiRequest({
      careerId: testCareerId,
      email: "wrongemail",
    });

    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(400);
  });

  it("should return 400 and validation error incorrect email format is used", async () => {
    const expectedResponse = {
      success: false,
      data: {
        errors: {
          email: ["The email format is invalid."],
        },
      },
    };

    const response = await makeApiRequest({
      careerId: testCareerId,
      email: "wrongemail",
    });

    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(400);
  });

  it("should return an error if the device is not yet linked with any golf course", async () => {
    const expectedResponse = {
      success: false,
      data: "No Course linked with the device",
    };

    // To make sure that the device is not linked with the course, we would call a service to unlink in case it is already linked
    await DevicesServices.update(testOrganizationDeviceId, { gcId: null });
    const response = await makeApiRequest({ careerId: testCareerId });
    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toBe(404);
  });

  it("should return an error if the device is not yet linked with any golf course", async () => {
    const expectedResponse = {
      success: false,
      data: "No Course linked with the device",
    };

    // To make sure that the device is not linked with the course, we would call a service to unlink in case it is already linked
    await DevicesServices.update(testOrganizationDeviceId, { gcId: null });
    const response = await makeApiRequest({ careerId: testCareerId });
    await DevicesServices.update(testOrganizationDeviceId, {
      gcId: testGolfCourseId,
    });

    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toBe(404);
  });

  it("should return 400 and sequelize validation error if both email and phone fields are set empty", async () => {
    const expectedResponse = {
      success: false,
      data: "Validation error: Phone and email can not be empty at the same time",
    };

    const response = await makeApiRequest({ careerId: testCareerId });

    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toBe(400);
  });

  it("should return 400 and validation error phone no is set but the contactMedium is not set", async () => {
    const expectedResponse = {
      success: false,
      data: "Validation error: Contact medium (text or call) is required",
    };

    const response = await makeApiRequest({
      careerId: testCareerId,
      phone: "+923091124124",
    });

    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toBe(400);
  });

  it("should create the contact request for the specified career with email", async () => {
    const candidateEmail = "xyz@email.com";
    const expectedResponse = {
      careerId: testCareerId,
      email: candidateEmail,
      orgId: testOrganizatonId,
      gcId: testGolfCourseId,
    };
    const response = await makeApiRequest({
      careerId: testCareerId,
      email: candidateEmail,
    });

    expect(response.body.data).toEqual(
      expect.objectContaining(expectedResponse),
    );
    expect(response.body.data).not.toHaveProperty(["phone", "contactMedium"]); // sequelize do not send the fields with null values by default.

    expect(response.body.success).toBe(true);
    expect(response.statusCode).toBe(200);
  });

  it("should create the contact request for the specified career with phone no and the contact medium 'text'", async () => {
    const candidatePhoneNo = "+923091112212";
    const expectedResponse = {
      careerId: testCareerId,
      phone: candidatePhoneNo,
      contactMedium: "text",
      orgId: testOrganizatonId,
      gcId: testGolfCourseId,
    };
    const response = await makeApiRequest({
      careerId: testCareerId,
      phone: candidatePhoneNo,
      contactMedium: "text",
    });

    expect(response.body.data).toEqual(
      expect.objectContaining(expectedResponse),
    );
    expect(response.body.data).not.toHaveProperty("email"); // sequelize do not send the fields with null values by default.
    expect(response.body.success).toBe(true);
    expect(response.statusCode).toBe(200);
  });

  it("should create the contact request for the specified career with phone no and the contact medium 'call'", async () => {
    const candidatePhoneNo = "+923091112212";
    const expectedResponse = {
      careerId: testCareerId,
      phone: candidatePhoneNo,
      contactMedium: "call",
      orgId: testOrganizatonId,
      gcId: testGolfCourseId,
    };
    const response = await makeApiRequest({
      careerId: testCareerId,
      phone: candidatePhoneNo,
      contactMedium: "call",
    });

    expect(response.body.data).toEqual(
      expect.objectContaining(expectedResponse),
    );
    expect(response.body.data).not.toHaveProperty("email"); // sequelize do not send the fields with null values by default.
    expect(response.body.success).toBe(true);
    expect(response.statusCode).toBe(200);
  });
});
