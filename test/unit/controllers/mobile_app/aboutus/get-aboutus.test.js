const testHelpers = require("../../../../helper");

let golferToken;

describe("GET /aboutus", () => {
  beforeAll(async () => {
    golferToken = await testHelpers.get_token_for("golfer");
  });

  const makeGetAboutUsApiRequest = async (token = golferToken) => {
    return await testHelpers.get_request_with_authorization({
      endpoint: "aboutus",
      token,
    });
  };

  it("should return about us content", async () => {
    const expectedResponse = {
      data: {
        id: 1,
        content: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
      success: true,
    };

    const response = await makeGetAboutUsApiRequest();
    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toEqual(200);
  });

  it("should return proper error response if there is a validation error", async () => {
    // Simulate a validation error condition, e.g., missing authorization token

    const invalidToken = "invalid-token";
    const response = await makeGetAboutUsApiRequest(invalidToken);

    expect(response.body).toEqual({
      data: "Token invalid or expire",
      success: false,
    });
    expect(response.statusCode).toEqual(401);
  });
});
