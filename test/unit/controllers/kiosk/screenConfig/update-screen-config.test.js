const helper = require("../../../../helper");
const models = require("../../../../../models/index");

describe("GET /api/v1/screen-config/courses/update-screen/{courseId}", () => {
  let adminToken;
  let customerToken;
  let testManagerToken;
  let differentOrganizationCustomerToken;
  let testOrganizationId = 1;
  let courseId;
  const validbody = { courseInfo: true, lessons: false };
  const invalidBody = { courseInfo: 1, lessons: false };
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

  const makeApiRequest = async (courseId, params, token = adminToken) => {
    return await helper.put_request_with_authorization({
      endpoint: `screen-config/courses/${courseId}`,
      params,
      token: token,
    });
  };

  it("should successfully update screen configurations for a given course", async () => {
    const response = await makeApiRequest(courseId, validbody);
    const { courseInfo, lessons } = response.body.data;
    const actualResponse = { courseInfo, lessons };
    expect(actualResponse).toMatchObject(validbody);
  });

  it("returns 200 status code Request with expected message for an invalid course ID", async () => {
    const response = await makeApiRequest(999);
    expect(response.status).toEqual(200);
    expect(response.body.data).toEqual("course not found");
  });
  it("ensure that organization customer can get screen details for the course belongs to same organization ", async () => {
    const response = await makeApiRequest(courseId, validbody, customerToken);
    const { courseInfo, lessons } = response.body.data;
    const actualResponse = { courseInfo, lessons };
    expect(actualResponse).toMatchObject(validbody);
  });
  it("returns validation error for an invalid course ID", async () => {
    const response = await makeApiRequest("aa");
    expect(response.body.data).toEqual("courseId must be a valid number");
  });
  it("should throw validation error when a non-boolean value is passed in the request body", async () => {
    const response = await makeApiRequest(courseId, invalidBody, customerToken);
    expect(response.body.data.errors).toEqual({
      courseInfo: ["The courseInfo field must be true or false."],
    });
  });
  it("should return an error if user belongs to same organization but do not have proper rights is not authorized", async () => {
    const response = await makeApiRequest(
      courseId,
      validbody,
      testManagerToken,
    );
    expect(response.body.data).toEqual("You are not allowed");
  });

  it("should return an error if user belongs to different organization", async () => {
    const response = await makeApiRequest(
      courseId,
      validbody,
      differentOrganizationCustomerToken,
    );
    expect(response.body.data).toEqual("You are not allowed");
  });
});
