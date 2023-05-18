const {
  organizationsInApplication,
} = require("../../../../../common/organizations.data");
const helper = require("../../../../helper");

const CoursesServices = require("../../../../../services/kiosk/course");

let testCustomerToken,
  superAdminToken,
  testOrganizatonId = organizationsInApplication.test.id,
  zongOrganizationId = organizationsInApplication.zong.id,
  course = {};

beforeAll(async () => {
  testCustomerToken = await helper.get_token_for("testCustomer");
  superAdminToken = await helper.get_token_for("superadmin");
});

afterAll(async () => {
  await CoursesServices.deleteWhere({ id: course.testGolfCourseId });
  await CoursesServices.deleteWhere({ id: course.zongGolfCourseId });
});
describe("GET /careers/courses/courseId", () => {
  const getCareersByCourseId = async (courseId, token = superAdminToken) => {
    return helper.get_request_with_authorization({
      endpoint: `careers/courses/${courseId}`,
      token,
    });
  };

  const makePostApiRequest = async (
    params,
    token = superAdminToken,
    endpoint = "kiosk-courses",
  ) => {
    return helper.post_request_with_authorization({
      params,
      endpoint,
      token,
    });
  };
  beforeAll(async () => {
    // create golf courses

    const testGolfCourseCreationResponse = await makePostApiRequest(
      {
        name: "TEST COURSE",
        orgId: testOrganizatonId,
        state: "Albama",
        city: "Abbeville",
      },
      superAdminToken,
      "kiosk-courses",
    );
    course.testGolfCourseId = testGolfCourseCreationResponse.body.data.id;

    const zongGolfCourseCreationResponse = await makePostApiRequest(
      {
        name: "ZONG COURSE",
        orgId: zongOrganizationId,
        state: "Albama",
        city: "Abbeville",
      },
      superAdminToken,
      "kiosk-courses",
    );

    course.zongGolfCourseId = zongGolfCourseCreationResponse.body.data.id;

    for await (const gcId of Object.values(course)) {
      await makePostApiRequest(
        {
          gcId,
          title: `Test Career ${gcId}`,
          content: "<h2>Example Content</h2>",
          type: "Full Time",
          timings: '{"startTime": "10:00", "endTime": "16:00"}',
          link: "https://example.com",
        },
        superAdminToken,
        "careers",
      );
    }
  });

  it("should return 400 and validation error for invalid course id", async () => {
    const expectedResponse = {
      success: false,
      data: "The courseId must be an integer.",
    };

    const response = await getCareersByCourseId(
      "invalidCourseId",
      testCustomerToken,
    );
    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(400);
  });

  it("should return empty array of careers if test organization's customer tries to get the careers of other organization's golf course", async () => {
    const expectedResponse = {
      success: true,
      data: [],
    };

    const response = await getCareersByCourseId(
      course.zongGolfCourseId,
      testCustomerToken,
    );
    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(200);
  });

  it("should return test organization's golf course's careers in case of test organization's scustomer", async () => {
    const expectedResponse = {
      gcId: course.testGolfCourseId,
      title: `Test Career ${course.testGolfCourseId}`,
      content: "<h2>Example Content</h2>",
      type: "Full Time",
      timings: { startTime: "10:00", endTime: "16:00" },
      link: "https://example.com",
    };
    const response = await getCareersByCourseId(
      course.testGolfCourseId,
      testCustomerToken,
    );
    expect(response.body.data).toEqual(
      expect.arrayContaining([expect.objectContaining(expectedResponse)]),
    );
    expect(response.body.success).toBe(true);
    expect(response.statusCode).toBe(200);
  });

  it("should return empty array if super admin tries to get the careers of the golf course that does not exist", async () => {
    const expectedResponse = {
      success: true,
      data: [],
    };
    const response = await getCareersByCourseId(-1, superAdminToken);
    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toBe(200);
  });

  it("should return careers if super admin tries to get the careers of the existing golf course", async () => {
    const expectedResponse = {
      gcId: course.zongGolfCourseId,
      title: `Test Career ${course.zongGolfCourseId}`,
      content: "<h2>Example Content</h2>",
      type: "Full Time",
      timings: { startTime: "10:00", endTime: "16:00" },
      link: "https://example.com",
    };
    const response = await getCareersByCourseId(
      course.zongGolfCourseId,
      superAdminToken,
    );
    expect(response.body.data).toEqual(
      expect.arrayContaining([expect.objectContaining(expectedResponse)]),
    );
    expect(response.body.success).toBe(true);
    expect(response.statusCode).toBe(200);
  });
});
