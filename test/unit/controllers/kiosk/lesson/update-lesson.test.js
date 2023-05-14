const helper = require("../../../../helper");
const upload_file = require("../../../../../common/upload");

// Mocking formidable
let mockFields;
let mockFiles;

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
  let orgId;
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
      endpoint: "kiosk-courses/create",
      token: adminToken,
      params: courses,
    });
    courseId = course.body.data.id;
    orgId = course.body.data.orgId;
    const createLesson = async () => {
      const fields = {
        gcId:courseId,
        name: "Mark Rober",
        title: "Assistant",
        content: "asdasdasdas asdasdasda",
        timings: "9:00-10:00",
      };

      const files = {
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

  const makeApiRequest = async (lessonId, params, token = adminToken) => {
    return helper.patch_request_with_authorization({
      endpoint: `course-lesson/${lessonId}`,
      params: params,
      token: token,
    });
  };

  it("should create a new course info with valid input", async () => {
    const fields = {
      gcId:courseId,
      name: "Mark -o plier",
      title: "Assistant Professor",
      content: "asdasdasdas asdasdasda",
      timings: "9:00-10:00",
    };

    const files = {
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

    const response = await makeApiRequest(lessonId, fields);
    expect(response.body.data[0]).toEqual(1);
  });
  it("should create a new course with the customer token who is the part of same organization", async () => {
    const fields = {
      gcId:courseId,
      name: "Pewdipie",
    };

    const files = {
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

    const response = await makeApiRequest(lessonId, fields, customerToken);
    expect(response.body.data[0]).toEqual(1);
  });
  it("should return an error if user belongs to different organization access api", async () => {
    const params = {};
    const response = await makeApiRequest(
      lessonId,
      params,
      differentOrganizationCustomerToken,
    );
    expect(response.body.data).toEqual("You are not allowed");
  });
});
