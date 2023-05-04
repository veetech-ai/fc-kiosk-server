const helper = require("../../../helper");
const models = require("../../../../models/index");
const Course = models.Course;
describe("GET /api/v1/screenconfig/courses/update-screen/{courseId}", () => {
  let adminToken;
  let customerToken;
  let testManagerToken;
  let differentOrganizationCustomerToken;
  let testOrganizationId = 1;
  const expected = {
    id: 1,
    gcId: 1,
    orgId: 1,
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
  let courseId
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
    const course=await helper.post_request_with_authorization({
      endpoint: "kiosk-courses/create",
      token: adminToken,
      params: courses,
    });
    courseId=course.body.data.id
  });

  const makeApiRequest = async (courseId,params, token = adminToken) => {
    console.log("adas", params);
    return await helper.put_request_with_authorization({
      endpoint: `screenconfig/courses/${courseId}`,
      params,
      token: token,
    });
  };

  it("should successfully update screen configurations for a given course", async () => {
    const body={courseInfo:true,lessons:false}
    const response = await makeApiRequest(courseId,body);
    const {courseInfo,lessons}=response.body.data
    const actualResponse={courseInfo,lessons}
    expect(actualResponse).toMatchObject(body)
  });

  it("returns 404 status code Request for an invalid course ID", async () => {
    const response = await makeApiRequest(999);
    expect(response.status).toEqual(404);
    expect(response.body.data).toEqual("course not found");
  });
  it("ensure that organization customer can get screen details for the course belongs to same organization ", async () => {
    const response = await makeApiRequest(1, customerToken);
    expect(response.body.data).toMatchObject(expected);
  });
  it("should return an error if user belongs to same organization but do not have proper rights is not authorized", async () => {
    const response = await makeApiRequest(1, testManagerToken);
    expect(response.body.data).toEqual("You are not allowed");
  });
  it("should return an error if user belongs to different organization", async () => {
    const response = await makeApiRequest(
      1,
      differentOrganizationCustomerToken,
    );
    expect(response.body.data).toEqual("You are not allowed");
  });
});
