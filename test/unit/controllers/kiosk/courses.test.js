const helper = require("../../../helper");
describe("POST /api/v1/kiosk-courses/create", () => {
  let adminToken;

  beforeAll(async () => {
    adminToken = await helper.get_token_for("admin");
  });

  const paramsCourseData = {
    name: "Test Course",
    state: "CA",
    city: "San Francisco",
    zip: "12345",
    phone: "555-1234",
    org_id: 2,
  };
  const validCourseData = {
    name: "Test Course",
    state: "CA",
    city: "San Francisco",
    zip: "12345",
    phone: "555-1234",
    orgId: 2,
  };

  const makeApiRequest = async (params) => {
    return helper.post_request_with_authorization({
      endpoint: "kiosk-courses/create",
      token: adminToken,
      params: params,
    });
  };

  it("should create a new course with valid input", async () => {
    const response = await makeApiRequest(paramsCourseData);
    expect(response.body.data).toMatchObject(validCourseData);
  });

  it("should return an error if organization does not exist", async () => {
    const invalidOrgIdData = { ...paramsCourseData, org_id: 999 };
    const response = await makeApiRequest(invalidOrgIdData);
    console.log("response is:", response.status);
    expect(response.status).toEqual(404);
    expect(response.body.data).toEqual("Invalid organization ID");
  });

  it("should return an error if input validation fails", async () => {
    const invalidPhoneData = { ...paramsCourseData, phone: 555 - 1234 };
    const response = await makeApiRequest(invalidPhoneData);

    expect(response.body.data.errors).toEqual({
      phone: ["The phone must be a string."],
    });
  });
});
