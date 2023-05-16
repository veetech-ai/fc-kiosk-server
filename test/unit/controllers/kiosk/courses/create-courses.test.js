const helper = require("../../../../helper");

describe("POST /api/v1/kiosk-courses", () => {
  let adminToken;
  let customerToken;
  beforeAll(async () => {
    adminToken = await helper.get_token_for("admin");
    customerToken = await helper.get_token_for("testCustomer");
  });

  const paramsCourseData = {
    name: "Test Course",
    state: "CA",
    city: "San Francisco",
    zip: "12345",
    phone: "555-1234",
    orgId: 1,
  };
  const validCourseData = {
    name: "Test Course",
    state: "CA",
    city: "San Francisco",
    zip: "12345",
    phone: "555-1234",
    orgId: 1,
  };

  const makeApiRequest = async (params, token = adminToken) => {
    return helper.post_request_with_authorization({
      endpoint: "kiosk-courses",
      token: token,
      params: params,
    });
  };

  it("should create a new course with valid input", async () => {
    const response = await makeApiRequest(paramsCourseData);
    expect(response.body.data).toMatchObject(validCourseData);
  });

  it("should return expected response if organization does not exist", async () => {
    const invalidOrgIdData = { ...paramsCourseData, orgId: 999 };
    const response = await makeApiRequest(invalidOrgIdData);
    expect(response.body.data).toEqual("Organization not found");
    expect(response.status).toEqual(404);
  });

  it("should return an error if input validation fails", async () => {
    const invalidPhoneData = { ...paramsCourseData, phone: 555 - 1234 };
    const response = await makeApiRequest(invalidPhoneData);

    expect(response.body.data.errors).toEqual({
      phone: ["The phone must be a string."],
    });
  });
  it("should return an error if user is not authorized", async () => {
    const invalidPhoneData = { ...paramsCourseData, phone: 555 - 1234 };
    const response = await makeApiRequest(invalidPhoneData, customerToken);

    expect(response.body.data).toEqual("You are not allowed");
  });
});
