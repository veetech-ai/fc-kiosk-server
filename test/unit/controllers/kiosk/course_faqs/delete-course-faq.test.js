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
  test: {
    question: "Test Question",
    answer: "Test Answer",
  },
  testUpdated: {
    question: "Test Question Updated",
    answer: "Sub Answer Updated",
  },
  zong: {
    question: "Zong Question",
    answer: "Zong Answer",
    description: "Extensive Description",
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

const makeApiRequest = async (faqId, token = adminToken) => {
  const faq = await helper.delete_request_with_authorization({
    endpoint: `course-faqs/${faqId}`,
    token: token,
  });
  return faq;
};


describe("DELETE /api/v1/course-faqs/{faqId}", () => {
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

    const reqBodyOne = { ...faqFixtures.test, gcId: testCourseId };
    const courseFaq = await createGolfCourseFaq(reqBodyOne, adminToken);
    testCourseFaqId = courseFaq.body.data.id;

    const reqBodyTwo = { ...faqFixtures.zong, gcId: zongCourseId };
    const zongCourseFaq = await createGolfCourseFaq(reqBodyTwo, adminToken);
    zongCourseFaqId = zongCourseFaq.body.data.id;
  });

  it("should return an error if the customer is of different org", async () => {
    const response = await makeApiRequest(testCourseFaqId, zongCustomerToken);
    const expectedResponse = "Faq not found";

    expect(response.body.data).toEqual(expectedResponse);
  });

  it("should return success message on deleting faq with same org customer", async () => {
    const response = await makeApiRequest(testCourseFaqId, customerToken);
    const expectedResponse = "Faq Deleted";

    expect(response.body.data).toEqual(expectedResponse);
  });

  it("should delete faq if the user is admin", async () => {
    const response = await makeApiRequest(zongCourseFaqId, adminToken);
    const expectedResponse = "Faq Deleted";

    expect(response.body.data).toEqual(expectedResponse);
  });
});
