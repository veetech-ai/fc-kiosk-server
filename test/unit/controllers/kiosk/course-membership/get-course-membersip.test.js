const helper = require("../../../../helper");
const product = require("../../../../../common/products");
const membershipService = require("../../../../../services/kiosk/membership");
const { uuid } = require("uuidv4");

let membershipId;

describe("GET /api/v1/course-membership/courses/{id}", () => {
  let adminToken;
  let courseId;
  let testOrganizationId = 1;
  let customerToken;
  let differentOrganizationCustomerToken;
  let reqBody;
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
    differentOrganizationCustomerToken = await helper.get_token_for(
      "zongCustomer",
    );
    const course = await helper.post_request_with_authorization({
      endpoint: "kiosk-courses",
      token: adminToken,
      params: courses,
    });
    courseId = course.body.data.id;
    const membership = await membershipService.getMembershipByCourseId(
      courseId,
    );
    membershipId = membership.id;
  });
  const makePatchApiRequest = async (membershipId, reqBody) => {
    await helper.patch_request_with_authorization({
      endpoint: `course-membership/${membershipId}`,
      token: adminToken,
      params: reqBody,
    });
  };
  const makeApiRequest = async (id, token = adminToken) => {
    return await helper.get_request_with_authorization({
      endpoint: `course-membership/courses/${id}`,
      token: token,
    });
  };

  it("should successfully list the memberships of the course", async () => {
    const expected = {
      gcId: courseId,
      link: null,
    };
    const response = await makeApiRequest(courseId);
    expect(response.body.data).toMatchObject(expected);
  });
  it("should successfully list the memberships of the course after updation of link", async () => {
    reqBody = {
      link: "https://github.com",
    };
    await makePatchApiRequest(membershipId, reqBody);
    const expected = {
      gcId: courseId,
      link: reqBody.link,
    };
    const response = await makeApiRequest(courseId);
    expect(response.body.data).toMatchObject(expected);
  });

  it("should successfully get the membership  if api is accessed by user with same organization", async () => {
    const expected = {
      gcId: courseId,
      link: reqBody.link,
    };
    const response = await makeApiRequest(courseId, customerToken);
    expect(response.body.data).toMatchObject(expected);
  });

  it("should return error if courseId is invalid", async () => {
    const invalidId = 99;
    const response = await makeApiRequest(invalidId);
    expect(response.body.data).toBe("Not found");
  });

  it("should return error if api is accessed by user with not same organization", async () => {
    const response = await makeApiRequest(
      courseId,
      differentOrganizationCustomerToken,
    );
    expect(response.body.data).toBe("You are not allowed");
  });
});
