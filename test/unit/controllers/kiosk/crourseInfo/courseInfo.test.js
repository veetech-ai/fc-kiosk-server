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
              name: "Sedona Golf Club Exclusive",
              holes: 18,
              par: 72,
              length: "6900",
              slope: "113",
              content: "Amazing course with beautiful landscapes",
              email: "sample123@gmail.com",
            },
            {
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
            },
          );
        },
      };
    }),
  };
});

describe("PATCH /api/v1/kiosk-courses/{courseId}/course-info", () => {
  let adminToken;
  let courseId;
  let testOperatorToken;
  let testOrganizationId = 1;

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
      endpoint: "kiosk-courses/create",
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
    jest
      .spyOn(upload_file, "uploadImage")
      .mockImplementation(() => Promise.resolve("mock-logo-url"));
    jest
      .spyOn(upload_file, "uploadImages")
      .mockImplementation(() => Promise.resolve("mock-images-url"));

    const params = {
      name: "Sedona Golf Club Exclusive",
      holes: 18,
      par: 72,
      length: 6900,
      slope: 113,
      content: "Amazing course with beautiful landscapes",
    };

    const response = await makeApiRequest(courseId, params);
    expect(response.body.data[0]).toEqual(1);
  });
  it("should return an error if user belongs to same organization but do not have proper rights is not authorized", async () => {
    const params = {};
    const response = await makeApiRequest(courseId, params, testOperatorToken);
    expect(response.body.data).toEqual("You are not allowed");
  });
});
