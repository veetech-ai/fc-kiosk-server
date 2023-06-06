const jwt = require("jsonwebtoken");

const { createFAQ, deleteFAQs } = require("../../../../../services/mobile/faq");
const testHelpers = require("../../../../helper");

let golferToken;
let golferId;

describe("GET /faq", () => {
  const faq = {
    question: "What is your expected salary?",
    answer: "130k",
  };

  beforeAll(async () => {
    golferToken = await testHelpers.get_token_for("golfer");
    golferId = jwt.decode(golferToken).id;
  });

  beforeAll(async () => {
    await deleteFAQs();
  });

  const makeGetFAQsApiRequest = async () => {
    return await testHelpers.get_request_with_authorization({
      endpoint: "faq",
      token: golferToken,
    });
  };

  it("should return an empty array if no FAQs found", async () => {
    const expectedResponse = {
      data: [],
      success: true,
    };

    // Delete all existing FAQs
    await deleteFAQs();

    const response = await makeGetFAQsApiRequest();
    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toEqual(200);
  });

  it("should return all FAQs in the database", async () => {
    // Create multiple FAQs
    const faq1 = {
      question: "Question 1",
      answer: "Answer 1",
    };
    const faq2 = {
      question: "Question 2",
      answer: "Answer 2",
    };
    await createFAQ(faq1);
    await createFAQ(faq2);

    const expectedResponse = {
      success: true,
      data: [
        {
          question: faq1.question,
          answer: faq1.answer,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          id: expect.any(Number),
        },
        {
          question: faq2.question,
          answer: faq2.answer,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          id: expect.any(Number),
        },
      ],
    };

    const response = await makeGetFAQsApiRequest();
    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toEqual(200);
  });
});
