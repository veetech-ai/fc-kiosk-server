// Import the required modules
const jwt = require("jsonwebtoken");
const { createFAQ, deleteFAQs } = require("../../../../../services/mobile/faq");
const testHelpers = require("../../../../helper");

let superAdminToken;

describe("DELETE /faqs", () => {
  // A sample FAQ object
  const faq = {
    question: "What is your expected salary?",
    answer: "130k",
  };

  // Execute this function before all the tests
  beforeAll(async () => {
    // Get the token for a superadmin user
    superAdminToken = await testHelpers.get_token_for("superadmin");
  });

  // Execute this function before each test
  beforeEach(async () => {
    // Delete all FAQs
    await deleteFAQs();
  });

  // Helper function to make DELETE request to delete an FAQ
  const makeDeleteFAQsApiRequest = async (id, token = superAdminToken) => {
    return await testHelpers.delete_request_with_authorization({
      endpoint: `faqs/${id}`,
      token,
    });
  };

  it("should delete an existing FAQ", async () => {
    // Create a new FAQ
    const expectedResponse = {
      success: true,
      data: "FAQ deleted successfully",
    };
    const newFAQ = await createFAQ(faq);

    // Make the DELETE request to delete the FAQ
    const response = await makeDeleteFAQsApiRequest(newFAQ.id);

    // Assert the response
    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toEqual(200);
  });

  it("should return Not Found if the FAQ does not exist", async () => {
    // Make the DELETE request with a non-existent FAQ ID
    const response = await makeDeleteFAQsApiRequest(999);

    // Assert the response
    expect(response.body.data).toBe("FAQ not found");
    expect(response.body.success).toBe(false);
    expect(response.statusCode).toEqual(404);
  });

  it("should return not allowed if the user does not have sufficient privileges", async () => {
    // Get the token for a golfer user
    const golferToken = await testHelpers.get_token_for("golfer");

    // Create a new FAQ
    const newFAQ = await createFAQ(faq);

    // Make the DELETE request with a user without sufficient privileges
    const response = await makeDeleteFAQsApiRequest(newFAQ.id, golferToken);

    // Assert the response
    expect(response.body.data).toBe("You are not allowed");
    expect(response.body.success).toBe(false);
    expect(response.statusCode).toEqual(403);
  });
});
