const helper = require("../../../../helper");
const upload_file = require("../../../../../common/upload");
const awsS3 = require("../../../../../common/external_services/aws-s3");
const ServiceError = require("../../../../../utils/serviceError");

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
let mockdeleteImage = jest
  .spyOn(awsS3, "deleteObject")
  .mockImplementation(() => Promise.resolve("Image Deleted"));
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
    const fields = {
      name: "Sedona Golf Club Exclusive",
      holes: 18,
      par: 72,
      length: "6900",
      slope: "113",
      content: "Amazing course with beautiful landscapes",
      email: "sample123@gmail.com",
    };
    const files = {
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
    };

    mockedCourseImageUpload.mockImplementation(() =>
      Promise.resolve(["253487236874=1267348214-23423"]),
    );
    mockedLogoImageUpload.mockImplementation(() =>
      Promise.resolve("87498234-432674823"),
    );
    mockFormidable(fields, files);

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
  it("should call upload course images method based on the number of times F keyword appear in the order array which comes from params or client side", async () => {
    const fields = {
      name: "Sedona Golf Club Exclusive",
      holes: 18,
      par: 72,
      length: "6900",
      slope: "113",
      content: "Amazing course with beautiful landscapes",
      email: "sample123@gmail.com",
      order: JSON.stringify(["L", "L", "F", "F"]),
      links: JSON.stringify([
        "3b8c03d1-13c2-46a4-aae2-b4e935b0f4c3",
        "b4a2d0cd-7e9e-41f2-a632-2f0c36a2a1a8",
      ]),
    };
    const files = {
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
    };

    mockFormidable(fields, files);

    const params = {
      name: "Sedona Golf Club Exclusive",
      holes: 18,
      par: 72,
      length: 6900,
      slope: 113,
      content: "Amazing course with beautiful landscapes",
    };
    const filteredOrder = JSON.parse(fields.order).filter(
      (item) => item === "F",
    );
    const response = await makeApiRequest(courseId, params);
    expect(mockedLogoImageUpload).toHaveBeenCalledTimes(filteredOrder.length);
  });
  it("should return error if there is an error while deleting images", async () => {
    const errorMessage = "Something went wrong";
    const fields = {
      name: "Sedona Golf Club Exclusive",
      holes: 18,
      par: 72,
      length: "6900",
      slope: "113",
      content: "Amazing course with beautiful landscapes",
      email: "sample123@gmail.com",
    };
    const files = {
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
    };

    mockedCourseImageUpload.mockImplementation(() =>
      Promise.resolve(["253487236874=1267348214-23423"]),
    );
    mockedLogoImageUpload.mockImplementation(() =>
      Promise.resolve("87498234-432674823"),
    );
    mockdeleteImage.mockImplementation(() =>
      Promise.reject(new ServiceError(errorMessage)),
    );
    mockFormidable(fields, files);
    const params = { ...fields, ...files };
    const response = await makeApiRequest(courseId, params);
    const expectedResponse = {
      success: false,
      data: errorMessage,
    };
    expect(response.body).toEqual(expectedResponse);
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
  it("should return an error when par input value is more than max value", async () => {
    const fields = {
      par: 11172,
    };
    const files = {
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
    };
    mockedCourseImageUpload.mockImplementation(() =>
      Promise.resolve(["253487236874=1267348214-23420"]),
    );
    mockedLogoImageUpload.mockImplementation(() =>
      Promise.resolve("87498234-432674821"),
    );
    mockdeleteImage.mockImplementation(() => Promise.resolve("Image Deleted"));
    const params = {
      ...fields,
    };
    mockFormidable(fields, files);
    const response = await makeApiRequest(courseId, params);
    const expectedResponse = {
      par: [
        "Par value must be an integer and have a minimum value of 1 and a maximum of 1000, and contain 1 to 4 digits",
      ],
    };

    expect(response.body.data.errors).toEqual(expectedResponse);
  });
  it("should return an error when par input value is less than min value", async () => {
    const fields = {
      par: -1,
    };
    const files = {
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
    };
    mockedCourseImageUpload.mockImplementation(() =>
      Promise.resolve(["253487236874=1267348214-23420"]),
    );
    mockedLogoImageUpload.mockImplementation(() =>
      Promise.resolve("87498234-432674821"),
    );
    mockdeleteImage.mockImplementation(() => Promise.resolve("Image Deleted"));
    const params = {
      ...fields,
    };
    mockFormidable(fields, files);
    const response = await makeApiRequest(courseId, params);
    const expectedResponse = {
      par: [
        "Par value must be an integer and have a minimum value of 1 and a maximum of 1000, and contain 1 to 4 digits",
      ],
    };

    expect(response.body.data.errors).toEqual(expectedResponse);
  });

  it("should return an error when par input value has more than 4 digits", async () => {
    const fields = {
      par: "002221",
    };
    const files = {
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
    };
    mockedCourseImageUpload.mockImplementation(() =>
      Promise.resolve(["253487236874=1267348214-23420"]),
    );
    mockedLogoImageUpload.mockImplementation(() =>
      Promise.resolve("87498234-432674821"),
    );
    mockdeleteImage.mockImplementation(() => Promise.resolve("Image Deleted"));
    const params = {
      ...fields,
    };
    mockFormidable(fields, files);
    const response = await makeApiRequest(courseId, params);
    const expectedResponse = {
      par: [
        "Par value must be an integer and have a minimum value of 1 and a maximum of 1000, and contain 1 to 4 digits",
      ],
    };

    expect(response.body.data.errors).toEqual(expectedResponse);
  });

  it("should return an error when yards input value is more than max value", async () => {
    const fields = {
      yards: 999999,
    };
    const files = {
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
    };
    mockedCourseImageUpload.mockImplementation(() =>
      Promise.resolve(["253487236874=1267348214-23420"]),
    );
    mockedLogoImageUpload.mockImplementation(() =>
      Promise.resolve("87498234-432674821"),
    );
    mockdeleteImage.mockImplementation(() => Promise.resolve("Image Deleted"));
    const params = {
      ...fields,
    };
    mockFormidable(fields, files);
    const response = await makeApiRequest(courseId, params);
    const expectedResponse = {
      yards: [
        "Yards value must be an integer and have a minimum value of 1 and a maximum of 10000, and contain 1 to 5 digits",
      ],
    };

    expect(response.body.data.errors).toEqual(expectedResponse);
  });
  it("should return an error when yards input value is less than min value", async () => {
    const fields = {
      yards: -1,
    };
    const files = {
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
    };
    mockedCourseImageUpload.mockImplementation(() =>
      Promise.resolve(["253487236874=1267348214-23420"]),
    );
    mockedLogoImageUpload.mockImplementation(() =>
      Promise.resolve("87498234-432674821"),
    );
    mockdeleteImage.mockImplementation(() => Promise.resolve("Image Deleted"));
    const params = {
      ...fields,
    };
    mockFormidable(fields, files);
    const response = await makeApiRequest(courseId, params);
    const expectedResponse = {
      yards: [
        "Yards value must be an integer and have a minimum value of 1 and a maximum of 10000, and contain 1 to 5 digits",
      ],
    };

    expect(response.body.data.errors).toEqual(expectedResponse);
  });

  it("should return an error when yards input value has more than 5 digits", async () => {
    const fields = {
      yards: "002221",
    };
    const files = {
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
    };
    mockedCourseImageUpload.mockImplementation(() =>
      Promise.resolve(["253487236874=1267348214-23420"]),
    );
    mockedLogoImageUpload.mockImplementation(() =>
      Promise.resolve("87498234-432674821"),
    );
    mockdeleteImage.mockImplementation(() => Promise.resolve("Image Deleted"));
    const params = {
      ...fields,
    };
    mockFormidable(fields, files);
    const response = await makeApiRequest(courseId, params);
    const expectedResponse = {
      yards: [
        "Yards value must be an integer and have a minimum value of 1 and a maximum of 10000, and contain 1 to 5 digits",
      ],
    };

    expect(response.body.data.errors).toEqual(expectedResponse);
  });

  it("should return an error when slope input value is more than max value", async () => {
    const fields = {
      slope: 999,
    };
    const files = {
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
    };
    mockedCourseImageUpload.mockImplementation(() =>
      Promise.resolve(["253487236874=1267348214-23420"]),
    );
    mockedLogoImageUpload.mockImplementation(() =>
      Promise.resolve("87498234-432674821"),
    );
    mockdeleteImage.mockImplementation(() => Promise.resolve("Image Deleted"));
    const params = {
      ...fields,
    };
    mockFormidable(fields, files);
    const response = await makeApiRequest(courseId, params);
    const expectedResponse = {
      slope: [
        "Slope value must be an integer and have a minimum value of 1 and a maximum of 500, and contain 1 to 3 digits",
      ],
    };

    expect(response.body.data.errors).toEqual(expectedResponse);
  });
  it("should return an error when slope input value is less than min value", async () => {
    const fields = {
      slope: -1,
    };
    const files = {
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
    };
    mockedCourseImageUpload.mockImplementation(() =>
      Promise.resolve(["253487236874=1267348214-23420"]),
    );
    mockedLogoImageUpload.mockImplementation(() =>
      Promise.resolve("87498234-432674821"),
    );
    mockdeleteImage.mockImplementation(() => Promise.resolve("Image Deleted"));
    const params = {
      ...fields,
    };
    mockFormidable(fields, files);
    const response = await makeApiRequest(courseId, params);
    const expectedResponse = {
      slope: [
        "Slope value must be an integer and have a minimum value of 1 and a maximum of 500, and contain 1 to 3 digits",
      ],
    };

    expect(response.body.data.errors).toEqual(expectedResponse);
  });

  it("should return an error when slope input value has more than 3 digits", async () => {
    const fields = {
      slope: "00021",
    };
    const files = {
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
    };
    mockedCourseImageUpload.mockImplementation(() =>
      Promise.resolve(["253487236874=1267348214-23420"]),
    );
    mockedLogoImageUpload.mockImplementation(() =>
      Promise.resolve("87498234-432674821"),
    );
    mockdeleteImage.mockImplementation(() => Promise.resolve("Image Deleted"));
    const params = {
      ...fields,
    };
    mockFormidable(fields, files);
    const response = await makeApiRequest(courseId, params);
    const expectedResponse = {
      slope: [
        "Slope value must be an integer and have a minimum value of 1 and a maximum of 500, and contain 1 to 3 digits",
      ],
    };

    expect(response.body.data.errors).toEqual(expectedResponse);
  });

  it("should return an error when year_built input value is more than current year", async () => {
    const fields = {
      year_built: 4000,
    };
    const files = {
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
    };
    mockedCourseImageUpload.mockImplementation(() =>
      Promise.resolve(["253487236874=1267348214-23420"]),
    );
    mockedLogoImageUpload.mockImplementation(() =>
      Promise.resolve("87498234-432674821"),
    );
    mockdeleteImage.mockImplementation(() => Promise.resolve("Image Deleted"));
    const params = {
      ...fields,
    };
    mockFormidable(fields, files);
    const response = await makeApiRequest(courseId, params);
    const expectedResponse = {
      year_built: ["year_built value must between 1000 to currentYear"],
    };

    expect(response.body.data.errors).toEqual(expectedResponse);
  });
  it("should return an error when year_built input value is less than Year 1000", async () => {
    const fields = {
      year_built: 999,
    };
    const files = {
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
    };
    mockedCourseImageUpload.mockImplementation(() =>
      Promise.resolve(["253487236874=1267348214-23420"]),
    );
    mockedLogoImageUpload.mockImplementation(() =>
      Promise.resolve("87498234-432674821"),
    );
    mockdeleteImage.mockImplementation(() => Promise.resolve("Image Deleted"));
    const params = {
      ...fields,
    };
    mockFormidable(fields, files);
    const response = await makeApiRequest(courseId, params);
    const expectedResponse = {
      year_built: ["year_built value must between 1000 to currentYear"],
    };

    expect(response.body.data.errors).toEqual(expectedResponse);
  });

  it("should return an error when year_built input value does not have 4 digits", async () => {
    const fields = {
      year_built: "002021",
    };
    const files = {
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
    };
    mockedCourseImageUpload.mockImplementation(() =>
      Promise.resolve(["253487236874=1267348214-23420"]),
    );
    mockedLogoImageUpload.mockImplementation(() =>
      Promise.resolve("87498234-432674821"),
    );
    mockdeleteImage.mockImplementation(() => Promise.resolve("Image Deleted"));
    const params = {
      ...fields,
    };
    mockFormidable(fields, files);
    const response = await makeApiRequest(courseId, params);
    const expectedResponse = {
      year_built: ["year_built value must between 1000 to currentYear"],
    };

    expect(response.body.data.errors).toEqual(expectedResponse);
  });
});
