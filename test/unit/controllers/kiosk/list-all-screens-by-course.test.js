const helper = require("../../../helper");
const models = require("../../../../models/index");
const Course = models.Course;
describe("GET /api/v1/screen-config/courses/{courseId}", () => {
  let adminToken;
  let customerToken;
  let testManagerToken;
  let differentOrganizationCustomerToken;
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
  let courseId;
  beforeAll(async () => {
    // Create some courses for the test organization
    const courses = {
      name: "Course 1",
      city: "Test City 1",
      state: "Test State 1",
      orgId: testOrganizationId,
    };

    adminToken = await helper.get_token_for("admin");
    customerToken = await helper.get_token_for("testCustomer");
    testManagerToken = await helper.get_token_for("testManager");
    differentOrganizationCustomerToken = await helper.get_token_for(
      "zongCustomer",
    );
    const course = await helper.post_request_with_authorization({
      endpoint: "kiosk-courses/create",
      token: adminToken,
      params: courses,
    });
    courseId = course.body.data.id;
  });

  const makeApiRequest = async (params, token = adminToken) => {
    return await helper.get_request_with_authorization({
      endpoint: `screen-config/courses/${params}`,
      token: token,
    });
  };

  it("returns 200 OK and an array of courses for a valid organization ID", async () => {
    const response = await makeApiRequest(courseId);
    expect(response.body.data).toMatchObject(expected);
  });

  it("returns 200 status code with expected response Request for an invalid course ID", async () => {
    const response = await makeApiRequest(999);
    expect(response.status).toEqual(200);
    expect(response.body.data).toEqual("course not found");
  });
  it("returns validation error for an invalid course ID", async () => {
    const response = await makeApiRequest("aa");
    expect(response.body.data).toEqual("courseId must be a valid number");
  });
  it("ensure that organization customer can get screen details for the course belongs to same organization ", async () => {
    const response = await makeApiRequest(courseId, customerToken);
    expect(response.body.data).toMatchObject(expected);
  });
  it("should return an error if user belongs to same organization but do not have proper rights is not authorized", async () => {
    const response = await makeApiRequest(courseId, testManagerToken);
    expect(response.body.data).toEqual("You are not allowed");
  });
  it("should return an error if user belongs to different organization", async () => {
    const response = await makeApiRequest(
      courseId,
      differentOrganizationCustomerToken,
    );
    expect(response.body.data).toEqual("You are not allowed");
  });
});
