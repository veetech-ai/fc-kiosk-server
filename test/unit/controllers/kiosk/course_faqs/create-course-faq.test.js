const helper = require("../../../../helper");
const upload_file = require("../../../../../common/upload");
const {
  organizationsInApplication,
} = require("../../../../../common/organizations.data");

// Fixtures
const coursesFixtures = {
  test: {
    name: "Course 1",
    city: "Test City 1",
    state: "Test State 1",
    orgId: organizationsInApplication.test.id,
  },
  zong: {
    name: "Course 2",
    city: "Test City 2",
    state: "Test State 2",
    orgId: organizationsInApplication.zong.id,
  },
};

const faqFixtures = {
  valid: {
    gcId: 1,
    question: "Question",
    answer: "Answer",
  },
  inValid: {
    gcId: 1,
    question: "Assistant",
  },
};

let adminToken;
let customerToken;
let zongCustomerToken;
let testOperatorToken;

// Helper Functions for this test
async function createGolfCourse(reqBody, token) {
  const course = await helper.post_request_with_authorization({
    endpoint: "kiosk-courses",
    token: token,
    params: reqBody,
  });
  return course;
}

const makeApiRequest = async (params, token = adminToken) => {
  return helper.post_request_with_authorization({
    endpoint: `course-faqs`,
    token: token,
    params: params,
  });
};

describe("POST /api/v1/course-faqs", () => {
  beforeAll(async () => {
    // Create some courses for the test organization
    adminToken = await helper.get_token_for("admin");
    customerToken = await helper.get_token_for("testCustomer");
    zongCustomerToken = await helper.get_token_for("zongCustomer");
    testOperatorToken = await helper.get_token_for("testOperator");

    const course = await createGolfCourse(coursesFixtures.test, adminToken);
    faqFixtures.valid.gcId = course.body.data.id;
  });

  it("should create a new course faq with valid input", async () => {
    const response = await makeApiRequest(faqFixtures.valid);

    const expectedResponse = {
      createdAt: expect.any(String),
      gcId: expect.any(Number),
      id: expect.any(Number),
      orgId: expect.any(Number),
      updatedAt: expect.any(String),
      question: faqFixtures.valid.question,
      answer: faqFixtures.valid.answer,
    };
    expect(response.body.data).toEqual(expectedResponse);
  });

  it("should create a new course faq for same org golf course", async () => {
    const response = await makeApiRequest(faqFixtures.valid, customerToken);
    const expectedResponse = {
      createdAt: expect.any(String),
      gcId: expect.any(Number),
      id: expect.any(Number),
      orgId: expect.any(Number),
      updatedAt: expect.any(String),
      question: faqFixtures.valid.question,
      answer: faqFixtures.valid.answer,
    };
    expect(response.body.data).toEqual(expectedResponse);
  });

  it("should not create a new course faq for different org golf course", async () => {
    const response = await makeApiRequest(faqFixtures.valid, zongCustomerToken);
    const expectedResponse = "Course not found";
    expect(response.body.data).toEqual(expectedResponse);
  });

  it("should return an error if user belongs to same organization but do not have proper rights is not authorized", async () => {
    const response = await makeApiRequest(faqFixtures.valid, testOperatorToken);
    expect(response.body.data).toEqual("You are not allowed");
  });

  it("should return an error if reqBody is invalid", async () => {
    const response = await makeApiRequest(faqFixtures.inValid, adminToken);
    console.log(response.body.data);
    const expectedResponse = {
      errors: {
        answer: ["The answer field is required."],
      },
    };
    expect(response.body.data).toEqual(expectedResponse);
  });
});
