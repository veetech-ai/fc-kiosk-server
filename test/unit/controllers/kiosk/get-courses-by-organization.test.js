const helper = require("../../../helper");
const models = require("../../../../models/index");
const Course = models.Course;
describe("GET /api/v1/kiosk-courses/{orgId}", () => {
  let adminToken;
  let customerToken;
  let testManagerToken;
  let zongCustomer;
  let testOrganizationId = 1;
  beforeAll(async () => {
    // Create some courses for the test organization
    const courses = [
      {
        name: "Course 1",
        city: "Test City 1",
        state: "Test State 1",
        org_id: testOrganizationId,
      },
      {
        name: "Course 2",
        city: "Test City 2",
        state: "Test State 2",
        org_id: testOrganizationId,
      },
      {
        name: "Course 3",
        city: "Test City 3",
        state: "Test State 3",
        org_id: testOrganizationId,
      },
    ];

    const response = await Course.bulkCreate(courses);
    adminToken = await helper.get_token_for("admin");
    customerToken = await helper.get_token_for("testCustomer");
    testManagerToken = await helper.get_token_for("testManager");
    differentOrganizationCustomerToken = await helper.get_token_for("zongCustomer");
  });
  const expected = {
    id: 1,
    name: "Course 1",
    city: "Test City 1",
    state: "Test State 1",
    orgId: 1,
  };

  const makeApiRequest = async (params, token = adminToken) => {
    return await helper.get_request_with_authorization({
      endpoint: `kiosk-courses/${params}`,
      token: token,
    });
  };

  it("returns 200 OK and an array of courses for a valid organization ID", async () => {
    const response = await makeApiRequest(1);
    expect(response.body.data).toEqual(
      expect.arrayContaining([expect.objectContaining(expected)]),
    );
    expect(response.status).toEqual(200);
  });

  it("returns 404 status code Request for an invalid organization ID", async () => {
    const response = await makeApiRequest(999);
    expect(response.status).toEqual(404);
    expect(response.body.data).toEqual("Organization not found");
  });
  it("returns empty array of courses if organization is not linked with course", async () => {
    const response = await makeApiRequest(2);
    expect(response.body.data).toEqual("No courses found for organization");
  });
  it("ensure that organization customer can get courses ", async () => {
    const response = await makeApiRequest(1, customerToken);
    expect(response.body.data).toEqual(
      expect.arrayContaining([expect.objectContaining(expected)]),
    );
  });
  it("should return an error if user belongs to same organization but do not have proper rights is not authorized", async () => {
    const response = await makeApiRequest(1, testManagerToken);
    expect(response.body.data).toEqual("You are not allowed");
  });
  it("should return an error if user belongs to different organization", async () => {
    const response = await makeApiRequest(1, differentOrganizationCustomerToken);
    expect(response.body.data).toEqual("You are not allowed");
  });
});
