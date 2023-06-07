// Import the required modules
const jwt = require("jsonwebtoken");
const { createFAQ, deleteFAQs } = require("../../../../../services/mobile/faq");
const testHelpers = require("../../../../helper");

let superAdminToken;

describe("PUT /faqs", () => {
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

  // Helper function to make PUT request to update FAQs
  const makePutFAQsApiRequest = async (id, body, token = superAdminToken) => {
    return await testHelpers.put_request_with_authorization({
      endpoint: `faqs/${id}`,
      token: token,
      params: body,
    });
  };

  it("should update an existing FAQ", async () => {
    // Create a new FAQ
    const existingFAQ = await createFAQ(faq);
    // Define updated question and answer
    const updatedQuestion = "What are the company benefits?";
    const updatedAnswer =
      "We offer competitive salary, health insurance, and flexible work hours.";

    // Define the updated FAQ object
    const updatedFAQ = {
      question: updatedQuestion,
      answer: updatedAnswer,
    };

    // Define the expected response
    const expectedResponse = {
      success: true,
      data: "FAQ updated successfully",
    };

    // Make the PUT request to update the FAQ
    const response = await makePutFAQsApiRequest(existingFAQ.id, updatedFAQ);

    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toEqual(200);
  });

  it("should return Not Found if the FAQ does not exist", async () => {
    // Make the PUT request with a non-existent FAQ ID
    const response = await makePutFAQsApiRequest(1234, faq);

    // Assert the response
    expect(response.body.data).toBe("FAQ already up to date");
    expect(response.body.success).toBe(true);
    expect(response.statusCode).toEqual(200);
  });

  it("should return not allowed if the user does not have sufficient privileges", async () => {
    // Create a new FAQ
    const existingFAQ = await createFAQ(faq);

    // Get the token for a golfer user
    const golferToken = await testHelpers.get_token_for("golfer");

    // Make the PUT request with a user without sufficient privileges
    const response = await makePutFAQsApiRequest(
      existingFAQ.id,
      faq,
      golferToken,
    );

    expect(response.body.success).toBe(false);
    expect(response.body.data).toBe("You are not allowed");
    expect(response.statusCode).toEqual(403);
  });
});
