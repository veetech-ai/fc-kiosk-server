const helper = require("../../../../helper");
const upload_file = require("../../../../../common/upload");

// Mocking formidable
let mockFields;
let mockFiles;
let fields;
let files;
jest.mock("formidable", () => {
  return {
    IncomingForm: jest.fn().mockImplementation(() => {
      return {
        multiples: true,
        parse: (req, cb) => {
          cb(null, mockFields, mockFiles);
        },
      };
    }),
  };
});

const mockFormidable = (fields, files) => {
  mockFields = fields;
  mockFiles = files;
};

describe("GET /api/v1/course-lesson/{lessonId}", () => {
  let adminToken;
  let courseId;
  let customerToken;
  let differentOrganizationCustomerToken;
  let testOrganizationId = 1;
  let testOperatorToken
  let lessonId;
  let invalidLessonId = -1;

  beforeAll(async () => {
    // Create some courses for the test organization
    const courses = {
      name: "Course 1",
      city: "Test City 1",
      state: "Test State 1",
      orgId: testOrganizationId,
    };

    adminToken = await helper.get_token_for("admin");
    customerToken = await helper.get_token_for("testCustomer");
    testOperatorToken = await helper.get_token_for("testOperator");
    differentOrganizationCustomerToken = await helper.get_token_for(
      "zongCustomer",
    );
    const course = await helper.post_request_with_authorization({
      endpoint: "kiosk-courses",
      token: adminToken,
      params: courses,
    });
    courseId = course.body.data.id;
    const createLesson = async () => {
      fields = {
        gcId: courseId,
        name: "Mark Rober",
        title: "Assistant",
        content: "asdasdasdas asdasdasda",
        timings: "9:00-10:00",
      };

      files = {
        image: {
          name: "mock-logo.png",
          type: "image/png",
          size: 5000, // bytes
          path: "/mock/path/to/logo.png",
        },
      };

      mockFormidable(fields, files);
      jest
        .spyOn(upload_file, "uploadImageForCourse")
        .mockImplementation(() => Promise.resolve("mock-logo-url"));
      const lesson = await helper.post_request_with_authorization({
        endpoint: `course-lesson`,
        token: adminToken,
        params: fields,
      });
      return lesson.body.data.id;
    };
    lessonId = await createLesson();
  });

  const makeApiRequest = async (id, token = adminToken) => {
    return await helper.get_request_with_authorization({
      endpoint: `course-lesson/${id}`,
      token: token,
    });
  };

  it("should successfully return lessons of specific courses with valid input", async () => {
    const expectedObject = {
      ...fields,
    };
    const response = await makeApiRequest(lessonId);
    expect(response.body.data).toEqual(expect.objectContaining(expectedObject));
  });
  it("should return error if courseId is not valid", async () => {
    const response = await makeApiRequest(invalidLessonId);
    expect(response.body.data).toBe("Not found");
  });
  it("should successfully return lessons of specific courses with valid input while api is accessd by customer of same organization", async () => {
    const expectedObject = {
      ...fields,
    };
    const response = await makeApiRequest(lessonId, customerToken);
    expect(response.body.data).toEqual(expect.objectContaining(expectedObject));
  });
  it("should return validation error for lessonId", async () => {
    const response = await makeApiRequest("dasd", customerToken);
    expect(response.body.data).toBe("lessonId must be a valid number");
  });
  it("should return error if api is accessed by customer of different organization", async () => {
    const response = await makeApiRequest(
      lessonId,
      differentOrganizationCustomerToken,
    );

    expect(response.body.data).toBe("Not found");
  });
});
