const helper = require("../../../../helper");
const upload_file = require("../../../../../common/upload");
const courseService = require("../../../../../services/mobile/courses");
const ServiceError = require("../../../../../utils/serviceError");
const adsService = require("../../../../../services/mobile/ads");

let mockFields;
let mockFiles;
const errorMessage = "Something went wrong";
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

let mockedFileUpload = jest
  .spyOn(upload_file, "upload_file")
  .mockImplementation(() => Promise.resolve("mock-ad-url"));
const mockFormidable = (fields, files) => {
  mockFields = fields;
  mockFiles = files;
};

describe("POST /api/v1/ads", () => {
  let adminToken;
  let courseId;
  let customerToken;

  beforeAll(async () => {
    // Create some courses for the test organization

    adminToken = await helper.get_token_for("admin");
    customerToken = await helper.get_token_for("testCustomer");
  });
  afterAll(async () => {
    await adsService.deleteAd({ gcId: courseId });
  });

  const makeAdApiRequest = async (params, token = adminToken) => {
    return await helper.post_request_with_authorization({
      endpoint: `ads`,
      token: token,
      params: params,
    });
  };

  it("should create a new ad info with valid input with admin or super admin token", async () => {
    const fields = {
      state: "Alabama",
      title: "Main Ad",
      screens: ["Hole 1", "Hole 2", "Hole 3", "Hole 4"],
      tapLink: "google.com",
    };

    const course = await courseService.getCourseFromDb({ state: fields.state });

    courseId = course.id;
    fields.gcId = courseId;

    const files = {
      smallImage: {
        name: "mock-logo.png",
        type: "image/png",
        size: 5000, // bytes
        path: "/mock/path/to/logo.png",
      },
    };

    const expectedResponse = {
      success: true,
      data: {
        id: expect.any(Number),
        smallImage: expect.any(String),
        gcId: fields.gcId,
        title: fields.title,
        screens: fields.screens,
        tapLink: fields.tapLink,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    };

    mockFormidable(fields, files);
    const response = await makeAdApiRequest(fields);
    expect(response.body).toEqual(expectedResponse);
  });
  it("should return empty array if no golf course is found on the basis of inputed state", async () => {
    const fields = {
      state: "Mobile",
      title: "Main Ad",
      screens: ["Hole 5"],
      tapLink: "google.com",
    };
    const query = {
      where: {
        state: fields.state,
      },
    };
    const courses = await courseService.getCourses(query);
    expect(courses.length).toBe(0);
  });
  it("should return error if screens given by user are invalid", async () => {
    const expectedResponse = {
      success: false,
      data: "Please enter valid screen names",
    };

    const fields = {
      state: "Alabama",
      title: "Main Ad",
      screens: ["Hole 20"],
    };

    const course = await courseService.getCourseFromDb({ state: fields.state });

    courseId = course.id;
    fields.gcId = courseId;
    const files = {
      smallImage: {
        name: "mock-bigImage.png",
        type: "image/png",
        size: 5000, // bytes
      },
    };

    mockFormidable(fields, files);
    const response = await makeAdApiRequest(fields);
    expect(response.body).toEqual(expectedResponse);
  });
  it("should return error if screens given by user are already occupied", async () => {
    const expectedResponse = {
      success: false,
      data: "Screen Occupied",
    };
    const fields = {
      state: "Alabama",
      title: "Main Ad",
      screens: ["Hole 1", "Hole 2", "Hole 3"],
    };

    const course = await courseService.getCourseFromDb({ state: fields.state });

    courseId = course.id;
    fields.gcId = courseId;
    const files = {
      smallImage: {
        name: "mock-bigImage.png",
        type: "image/png",
        size: 5000, // bytes
      },
    };

    mockFormidable(fields, files);
    const response = await makeAdApiRequest(fields);
    expect(response.body).toEqual(expectedResponse);
  });
  it("should return validation error in case of invalid input for screens", async () => {
    const fields = {
      state: "Alabama",
      title: "Main Ad",
      screens: "Hole 17",
      tapLink: "google.com",
    };

    const course = await courseService.getCourseFromDb({ state: fields.state });

    courseId = course.id;
    fields.gcId = courseId;

    const files = {
      smallImage: {
        name: "mock-logo.png",
        type: "image/png",
        size: 5000, // bytes
        path: "/mock/path/to/logo.png",
      },
    };

    const expectedResponse = {
      success: false,
      data: "Invalid JSON in screens",
    };

    mockFormidable(fields, files);
    const response = await makeAdApiRequest(fields);
    expect(response.body).toEqual(expectedResponse);
  });
  it("should return error if tapLink is invalid", async () => {
    const fields = {
      state: "Alabama",
      title: "Secondary Ad",
      screens: ["Hole 15"],
      tapLink: "yahoo",
    };
    const course = await courseService.getCourseFromDb({ state: fields.state });

    courseId = course.id;
    fields.gcId = courseId;
    const files = {
      smallImage: {
        name: "mock-logo.png",
        type: "image/png",
        size: 5000, // bytes
      },
    };

    const expectedResponse = {
      success: false,
      data: "Validation error: Validation isUrl on tapLink failed",
    };

    mockFormidable(fields, files);
    const response = await makeAdApiRequest(fields);
    expect(response.body).toEqual(expectedResponse);
  });
  it("should return validation error if both both tapLink and bigImage is not defined", async () => {
    const fields = {
      state: "Alabama",
      title: "Main Ad",
      screens: ["Hole 6"],
    };

    const course = await courseService.getCourseFromDb({ state: fields.state });

    courseId = course.id;
    fields.gcId = courseId;

    const files = {
      smallImage: {
        name: "mock-logo.png",
        type: "image/png",
        size: 5000, // bytes
        path: "/mock/path/to/logo.png",
      },
    };

    mockFormidable(fields, files);
    const response = await makeAdApiRequest(fields);
    expect(response.body.data).toEqual(
      "Validation error: Both bigImage and tapLink cannot be null at the same time. At least one must be populated.",
    );
  });
  it("should return validation error if both both tapLink and bigImage are defined for same instance of Ad", async () => {
    const fields = {
      state: "Alabama",
      title: "Main Ad",
      screens: ["Hole 7", "Hole 8"],
      tapLink: "google.com",
    };

    const course = await courseService.getCourseFromDb({ state: fields.state });

    courseId = course.id;
    fields.gcId = courseId;

    const files = {
      smallImage: {
        name: "mock-logo.png",
        type: "image/png",
        size: 5000, // bytes
        path: "/mock/path/to/logo.png",
      },
      bigImage: {
        name: "mock-logo.png",
        type: "image/png",
        size: 5000, // bytes
        path: "/mock/path/to/logo.png",
      },
    };

    mockFormidable(fields, files);
    const response = await makeAdApiRequest(fields);
    expect(response.body.data).toEqual(
      "Validation error: Both bigImage and tapLink cannot be populated at the same time.",
    );
  });
  it("should return validation error if smallImage which is required is not defined", async () => {
    const fields = {
      state: "Alabama",
      title: "Main Ad",
      screens: ["Hole 9"],
    };

    const course = await courseService.getCourseFromDb({ state: fields.state });

    courseId = course.id;
    fields.gcId = courseId;

    const files = {
      bigImage: {
        name: "mock-logo.png",
        type: "image/png",
        size: 5000, // bytes
        path: "/mock/path/to/logo.png",
      },
    };

    mockFormidable(fields, files);
    const response = await makeAdApiRequest(fields);
    expect(response.body.data).toEqual(
      "notNull Violation: Ad.smallImage cannot be null",
    );
  });
  it("should return validation error if api is accessed by the user other than admin", async () => {
    const response = await makeAdApiRequest({}, customerToken);
    expect(response.body.data).toEqual("You are not allowed");
  });
  it("should return error if an error occurred while image uploading", async () => {
    const fields = {
      state: "Alabama",
      title: "Main Ad",
      screens: ["Hole 10"],
      tapLink: "google.com",
    };

    const course = await courseService.getCourseFromDb({ state: fields.state });

    courseId = course.id;
    fields.gcId = courseId;

    const files = {
      smallImage: {
        name: "mock-logo.png",
        type: "image/png",
        size: 5000, // bytes
        path: "/mock/path/to/logo.png",
      },
    };

    mockFormidable(fields, files);
    mockedFileUpload.mockImplementation(() =>
      Promise.reject(new ServiceError("Something went wrong")),
    );

    const response = await makeAdApiRequest(fields);
    expect(response.body.success).toBe(false);
    expect(response.body.data).toBe(errorMessage);
  });
});
