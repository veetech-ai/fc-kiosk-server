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
let mockedCourseImageUpload = jest
  .spyOn(upload_file, "uploadCourseImages")
  .mockImplementation(() => Promise.resolve("mock-ad-url"));
  let mockedLogoImageUpload = jest
  .spyOn(upload_file, "uploadCourseImage")
  .mockImplementation(() => Promise.resolve("mock-ad-url"));
const mockFormidable = (fields, files) => {
  mockFields = fields;
  mockFiles = files;
};


describe("PATCH /api/v1/kiosk-courses/{courseId}/course-info", () => {
  let adminToken;
  let courseId;
  let testOperatorToken;
  let testOrganizationId = 1;
  let nonExistingCourseID = -1;

  beforeAll(async () => {
    // Create some courses for the test organization
    const courses = {
      name: "Course 1",
      city: "Test City 1",
      state: "Test State 1",
      orgId: testOrganizationId,
    };

    adminToken = await helper.get_token_for("admin");
    testOperatorToken = await helper.get_token_for("testOperator");
    const course = await helper.post_request_with_authorization({
      endpoint: "kiosk-courses",
      token: adminToken,
      params: courses,
    });
    courseId = course.body.data.id;
  });

  const makeApiRequest = async (courseId, params, token = adminToken) => {
    return helper.patch_request_with_authorization({
      endpoint: `kiosk-courses/${courseId}/course-info`,
      token: token,
      params: params,
    });
  };

  it("should create a new course info with valid input", async () => {

    const fields={
      name: "Sedona Golf Club Exclusive",
      holes: 18,
      par: 72,
      length: "6900",
      slope: "113",
      content: "Amazing course with beautiful landscapes",
      email: "sample123@gmail.com",
    }
    const files={
      logo: {
        name: "mock-logo.png",
        type: "image/png",
        size: 5000, // bytes
        path: "/mock/path/to/logo.png",
      },
      course_images: [
        {
          name: "mock-course-image1.png",
          type: "image/png",
          size: 5000, // bytes
          path: "/mock/path/to/course-image1.png",
        },
        {
          name: "mock-course-image2.png",
          type: "image/png",
          size: 5000, // bytes
          path: "/mock/path/to/course-image2.png",
        },
      ],
    }
    
    mockedCourseImageUpload.mockImplementation(()=> Promise.resolve(["253487236874=1267348214-23423"]))
    mockedLogoImageUpload.mockImplementation(()=> Promise.resolve("87498234-432674823"))
    mockFormidable(fields,files)

    const params = {
      name: "Sedona Golf Club Exclusive",
      holes: 18,
      par: 72,
      length: 6900,
      slope: 113,
      content: "Amazing course with beautiful landscapes",
    };

    const response = await makeApiRequest(courseId, params);
    expect(response.body.data).toEqual(1);
  });
  it("should return an error if user belongs to same organization but do not have proper rights is not authorized", async () => {
    const params = {};
    const response = await makeApiRequest(courseId, params, testOperatorToken);
    expect(response.body.data).toEqual("You are not allowed");
  });
  it("should return an error if user belongs to different organization", async () => {
    const params = {};
    const response = await makeApiRequest(
      nonExistingCourseID,
      params,
      adminToken,
    );
    expect(response.body.data).toBe("Course not found");
  });
});
