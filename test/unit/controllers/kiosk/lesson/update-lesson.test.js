const helper = require("../../../../helper");
const upload_file = require("../../../../../common/upload");

// Mocking formidable
jest.mock("formidable", () => {
  return {
    IncomingForm: jest.fn().mockImplementation(() => {
      return {
        multiples: true,
        parse: (req, cb) => {
          cb(
            null,
            {
              name: "Mark Rober",
              title: "Assistant",
              content: "asdasdasdas asdasdasda",
              timings: "9:00-10:00",
            },
            {
              image: {
                name: "mock-logo.png",
                type: "image/png",
                size: 5000, // bytes
                path: "/mock/path/to/logo.png",
              },
            },
          );
        },
      };
    }),
  };
});

describe("PATCH /api/v1/kiosk-courses/lesson/{lessonId}", () => {
  let adminToken;
  let courseId;
  let orgId;
  let customerToken;
  let testOperatorToken;
  let testOrganizationId = 1;
    let lessonId;

  beforeAll(async () => {
    // Create some courses for the test organization
    const courses = {
      name: "Course 1",
      city: "Test City 1",
      state: "Test State 1",
      orgId: testOrganizationId,
    };
    const lessonsFields={
        name: "Mark Rober",
        title: "Assistant",
        content: "asdasdasdas asdasdasda",
        timings: "9:00-10:00",
    }

    adminToken = await helper.get_token_for("admin");
    customerToken = await helper.get_token_for("testCustomer");
    testOperatorToken = await helper.get_token_for("testOperator");
    const course = await helper.post_request_with_authorization({
      endpoint: "kiosk-courses/create",
      token: adminToken,
      params: courses,
    });
    courseId = course.body.data.id;
    orgId = course.body.data.orgId;
   const lesson= await helper.post_request_with_authorization({
        endpoint: `kiosk-courses/${orgId}/${courseId}/lesson`,
        token: adminToken,
        params: lessonsFields,
      });
    lessonId=lesson.body.data.id
  });

  const makeApiRequest = async (
    lessonsId,
    params,
    token = adminToken,
  ) => {
    return helper.post_request_with_authorization({
      endpoint: `kiosk-courses/lesson/${lessonId}`,
      token: token,
      params: params,
    });
  };

  it.only("should create a new course info with valid input", async () => {
    jest
      .spyOn(upload_file, "uploadImage")
      .mockImplementation(() => Promise.resolve("mock-logo-url"));

    const lessonFieldsToUpdate = {
      name: "Mark Rober",
      title: "Assistant",
      content: "asdasdasdas asdasdasda",
      timings: "9:00-10:00",
    };

    const response = await makeApiRequest(lessonId, lessonFieldsToUpdate);
   

  });
  it("should return an error if user belongs to same organization but do not have proper rights is not authorized", async () => {
    const params = {};
    const response = await makeApiRequest(
      courseId,
      orgId,
      params,
      testOperatorToken,
    );
    expect(response.body).toEqual("You are not allowed");
  });
});
