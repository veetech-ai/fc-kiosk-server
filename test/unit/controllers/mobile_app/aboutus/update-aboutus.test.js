// Import the required modules

const testHelpers = require("../../../../helper");

let superAdminToken;

describe("PUT /aboutus", () => {
  // A sample FAQ object
  const body = {
    content: "What is your expected salary?",
  };

  // Execute this function before all the tests
  beforeAll(async () => {
    // Get the token for a superadmin user
    superAdminToken = await testHelpers.get_token_for("superadmin");
  });

  // Helper function to make PUT request to update FAQs
  const makePutAboutUsApiRequest = async (
    body,
    token = superAdminToken,
    id = 1,
  ) => {
    return await testHelpers.put_request_with_authorization({
      endpoint: `aboutus/${id}`,
      token: token,
      params: body,
    });
  };

  it("should update About us", async () => {
    // Define the expected response
    const expectedResponse = {
      success: true,
      data: "AboutUs updated successfully",
    };

    // Make the PUT request to update the FAQ
    const response = await makePutAboutUsApiRequest(body);

    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toEqual(200);
  });

  it("should return 'Not Allowed' if the user does not have sufficient privileges", async () => {
    // Get the token for a golfer user
    const golferToken = await testHelpers.get_token_for("golfer");

    // Make the PUT request with a user without sufficient privileges
    const response = await makePutAboutUsApiRequest(body, golferToken);

    expect(response.body.data).toBe("You are not allowed");
    expect(response.body.success).toBe(false);
    expect(response.statusCode).toEqual(403);
  });

  it("should return 'AboutUs already up to date' if the request body is missing or invalid", async () => {
    const invalidBody = {}; // Missing required 'content' field

    const response = await makePutAboutUsApiRequest(invalidBody);

    expect(response.body.data).toBe("AboutUs already up to date");
    expect(response.body.success).toBe(true);
    expect(response.statusCode).toEqual(200);
  });
});
