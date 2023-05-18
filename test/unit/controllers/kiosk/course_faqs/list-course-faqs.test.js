const helper = require("../../../../helper");
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

const FaqFixtures = {
  test: {
    question: "Test Question",
    answer: "Test Answer",
  },
  zong: {
    question: "Zong Question",
    answer: "Zong Answer",
  },
};

let testCourseId;
let zongCourseId;
let testCourseFaqId;
let zongCourseFaqId;
let adminToken;
let customerToken;
let zongCustomerToken;
let testOperatorToken;

// Helper Functions for this test
async function createGolfCourse(reqBody, token = adminToken) {
  const course = await helper.post_request_with_authorization({
    endpoint: "kiosk-courses",
    token: token,
    params: reqBody,
  });
  return course;
}

async function createGolfCourseFaq(reqBody, token = adminToken) {
  const courseFaq = await helper.post_request_with_authorization({
    endpoint: "course-faqs",
    token: token,
    params: reqBody,
  });

  return courseFaq;
}

const makeApiRequest = async (courseId, token = adminToken) => {
  const faqs = await helper.get_request_with_authorization({
    endpoint: `course-faqs/courses/${courseId}`,
    token: token,
  });
  return faqs;
};

describe("GET /api/v1/course-faqs/courses/{courseId}", () => {
  beforeAll(async () => {
    // Create some courses for the test organization
    adminToken = await helper.get_token_for("admin");
    customerToken = await helper.get_token_for("testCustomer");
    zongCustomerToken = await helper.get_token_for("zongCustomer");
    testOperatorToken = await helper.get_token_for("testOperator");

    const course = await createGolfCourse(coursesFixtures.test, adminToken);
    const zongCourse = await createGolfCourse(coursesFixtures.zong, adminToken);

    testCourseId = course.body.data.id;
    zongCourseId = zongCourse.body.data.id;

    const reqBodyOne = { ...FaqFixtures.test, gcId: testCourseId };

    const courseFaq = await createGolfCourseFaq(reqBodyOne, adminToken);
    testCourseFaqId = courseFaq.body.data.id;

    const reqBodyTwo = { ...FaqFixtures.zong, gcId: zongCourseId };

    const zongCourseFaq = await createGolfCourseFaq(reqBodyTwo, adminToken);
    zongCourseFaqId = zongCourseFaq.body.data.id;
  });

  it("should return a list faqs for the golf course", async () => {
    const response = await makeApiRequest(testCourseId);
    const expectedResponse = {
      createdAt: expect.any(String),
      gcId: expect.any(Number),
      id: expect.any(Number),
      orgId: expect.any(Number),
      updatedAt: expect.any(String),
      question: "Test Question",
      answer: "Test Answer",
    };
    expect(response.body.data).toEqual(
      expect.arrayContaining([expect.objectContaining(expectedResponse)]),
    );
  });

  it("should return faqs for courses to the same org customer", async () => {
    const response = await makeApiRequest(testCourseId, customerToken);
    const expectedResponse = {
      createdAt: expect.any(String),
      gcId: expect.any(Number),
      id: expect.any(Number),
      orgId: expect.any(Number),
      updatedAt: expect.any(String),
      question: "Test Question",
      answer: "Test Answer",
    };

    expect(response.body.data).toEqual(
      expect.arrayContaining([expect.objectContaining(expectedResponse)]),
    );
  });

  it("should return an error if the golf course is of different org", async () => {
    const response = await makeApiRequest(testCourseId, zongCustomerToken);
    const expectedResponse = "Course not found";

    expect(response.body.data).toEqual(expectedResponse);
  });
});
