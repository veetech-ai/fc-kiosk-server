const helper = require("../../../../helper");
const product = require("../../../../../common/products");
const membershipService = require("../../../../../services/kiosk/membership");
const { uuid } = require("uuidv4");

let membershipId;

describe("PATCH /api/v1/course-membership/{id}", () => {
  let adminToken;
  let courseId;
  let testOrganizationId = 1;
  let customerToken;
  let differentOrganizationCustomerToken;

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

  const makeApiRequest = async (membershipId, reqBody, token = adminToken) => {
    return await helper.patch_request_with_authorization({
      endpoint: `course-membership/${membershipId}`,
      token: token,
      params: reqBody,
    });
  };

  it("should successfully update with valid input", async () => {
    const reqBody = {
      link: "https://github.com",
    };
    const response = await makeApiRequest(membershipId, reqBody);
    expect(response.body.data).toBe(1);
  });
  it("should not update if request body is empty", async () => {
    const response = await makeApiRequest(membershipId, {});
    expect(response.body.data).toBe(0);
  });

  it("should throw a validation error if reqBody is invalid", async () => {
    const reqBody = {
      link: "google",
    };
    const response = await makeApiRequest(membershipId, reqBody, customerToken);
    expect(response.body.data).toBe(
      "Validation error: Validation isUrl on link failed",
    );
  });

  it("should return error if api is accessed by user with not same organization", async () => {
    const reqBody = {
      link: "https://github.com",
    };
    const response = await makeApiRequest(
      membershipId,
      reqBody,
      differentOrganizationCustomerToken,
    );
    expect(response.body.data).toBe("Membership not found");
  });
});
