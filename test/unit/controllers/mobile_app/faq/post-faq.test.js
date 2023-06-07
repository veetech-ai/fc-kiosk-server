// Import the required modules
const jwt = require("jsonwebtoken");
const { deleteFAQs } = require("../../../../../services/mobile/faq");
const testHelpers = require("../../../../helper");

let superAdminToken;

describe("POST /faqs", () => {
  // Define the FAQ object
  const newFAQ = {
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

  // Helper function to make POST request to create FAQs
  const makePostFAQsApiRequest = async (body, token = superAdminToken) => {
    return await testHelpers.post_request_with_authorization({
      endpoint: `faqs`,
      token: token,
      params: body,
    });
  };

  it("should create a new FAQ", async () => {
    // Define the expected response
    const expectedResponse = {
      success: true,
      data: {
        id: expect.any(Number),
        question: newFAQ.question,
        answer: newFAQ.answer,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    };

    // Make the POST request to create a new FAQ
    const response = await makePostFAQsApiRequest(newFAQ);

    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toEqual(201);
  });

  it("should return Bad Request if the request body is missing", async () => {
    // Make the POST request with an empty body
    const response = await makePostFAQsApiRequest({});

    const expectedResponse = {
      errors: {
        answer: ["The answer field is required."],
        question: ["The question field is required."],
      },
    };

    expect(response.body.success).toBe(false);
    expect(response.body.data).toEqual(expectedResponse);
    expect(response.statusCode).toEqual(400);
  });

  it("should return Bad Request if the question is missing", async () => {
    // Define the FAQ object with missing question
    const newFAQ = {
      answer: "130k",
    };

    // Make the POST request with missing question
    const response = await makePostFAQsApiRequest(newFAQ);

    const expectedResponse = {
      errors: {
        question: ["The question field is required."],
      },
    };

    expect(response.body.success).toBe(false);
    expect(response.body.data).toEqual(expectedResponse);
    expect(response.statusCode).toEqual(400);
  });

  it("should return Bad Request if the answer is missing", async () => {
    // Define the FAQ object with missing answer
    const newFAQ = {
      question: "What is your expected salary?",
    };

    // Make the POST request with missing answer
    const response = await makePostFAQsApiRequest(newFAQ);

    const expectedResponse = {
      errors: {
        answer: ["The answer field is required."],
      },
    };

    expect(response.body.success).toBe(false);
    expect(response.body.data).toEqual(expectedResponse);
    expect(response.statusCode).toEqual(400);
  });

  it("should return not allowed if the user does not have sufficient privileges", async () => {
    // Get the token for a golfer user
    const golferToken = await testHelpers.get_token_for("golfer");

    // Make the PUT request with a user without sufficient privileges
    const response = await makePostFAQsApiRequest(newFAQ, golferToken);

    expect(response.body.success).toBe(false);
    expect(response.body.data).toBe("You are not allowed");
    expect(response.statusCode).toEqual(403);
  });
});
