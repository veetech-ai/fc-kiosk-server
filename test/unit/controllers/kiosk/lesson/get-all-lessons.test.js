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

describe("PATCH /api/v1/course-lesson/{lessonId}", () => {
  let adminToken;
  let courseId;
  let customerToken;
  let testOperatorToken;
  let differentOrganizationCustomerToken;
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
    await createLesson();
  });

  const makeApiRequest = async (courseId, token = adminToken) => {
    return await helper.get_request_with_authorization({
      endpoint: `course-lesson/courses/${courseId}`,
      token: token,
    });
  };

  it("should successfully return lessons of specific courses with valid input", async () => {
    const expectedObject = {
      ...fields,
    };
    const response = await makeApiRequest(courseId);
    expect(response.body.data).toEqual(
      expect.arrayContaining([expect.objectContaining(expectedObject)]),
    );
  });
  it("should return error if courseId is not valid", async () => {
    const invalidCoureId = 99;
    const response = await makeApiRequest(invalidCoureId);
    expect(response.body.data).toBe("Course not found");
  });
  it("should successfully return lessons of specific courses with valid input while api is accessd by customer of same organization", async () => {
    const expectedObject = {
      ...fields,
    };
    const response = await makeApiRequest(courseId, customerToken);
    expect(response.body.data).toEqual(
      expect.arrayContaining([expect.objectContaining(expectedObject)]),
    );
  });
  it("should return error if api is accessd by customer of different organization", async () => {
    const response = await makeApiRequest(
      courseId,
      differentOrganizationCustomerToken,
    );
    expect(response.body.data).toBe("You are not allowed");
  });

  it("should return validation error for courseId", async () => {
    const response = await makeApiRequest("dasd", customerToken);
    expect(response.body.data).toBe("courseId must be a valid number");
  });
});
