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

  const makeAdApiRequest = async (params, token = adminToken) => {
    return await helper.post_request_with_authorization({
      endpoint: `ads`,
      token: token,
      params: params,
    });
  };

  describe("Success", () => {
    it("should create a new ad info with valid input with admin or super admin token", async () => {
      const fields = {
        state: "Alabama",
        title: "Main Ad",
        courses: '{ "1": ["Hole 1", "Hole 2", "Hole 3", "Hole 4"] }',
        tapLink: "www.google.com",
      };

      const course = await courseService.getCourseFromDb({
        state: fields.state,
      });

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

      expect(response.body).toEqual({
        success: true,
        data: {
          id: expect.any(Number),
          title: "Main Ad",
          smallImage: expect.any(String),
          courses: expect.any(Array),
          tapLink: fields.tapLink,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      });

      await adsService.deleteAd({ id: response.body.data.id });
    });

    it("should return created record, successfully for valid phone number", async () => {
      const fields = {
        state: "Alabama",
        title: "Main Ad",
        courses: '{ "1": ["Hole 1", "Hole 2", "Hole 3", "Hole 4"] }',
        tapLink: "tel:5554545455",
      };

      const course = await courseService.getCourseFromDb({
        state: fields.state,
      });

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
          title: fields.title,
          courses: expect.any(Array),
          tapLink: fields.tapLink,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      };

      mockFormidable(fields, files);
      const response = await makeAdApiRequest(fields);
      expect(response.body.data).toEqual(expectedResponse.data);

      await adsService.deleteAd({ id: response.body.data.id });
    });
  });

  describe("Failure", () => {
    it("should return error if screens given by user are invalid", async () => {
      const fields = {
        state: "Alabama",
        title: "Main Ad",
        tapLink: "www.metube.com",
        courses: '{ "1": ["This screen should not exist"] }',
      };

      const course = await courseService.getCourseFromDb({
        state: fields.state,
      });

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
      expect(response.body).toEqual({
        success: false,
        data: "Please enter valid screen names",
      });
    });

    it("should return validation error in case of invalid input for courses", async () => {
      const fields = {
        state: "Alabama",
        title: "Main Ad",
        courses: "Hole 17",
        tapLink: "www.google.com",
      };

      const course = await courseService.getCourseFromDb({
        state: fields.state,
      });

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

      expect(response.body).toEqual({
        success: false,
        data: "Invalid courses payload",
      });
    });

    it("should return validation error if both both tapLink and bigImage is not defined", async () => {
      const fields = {
        state: "Alabama",
        title: "Main Ad",
        courses: '{ "1": ["Hole 1", "Hole 2", "Hole 3", "Hole 4"] }',
      };

      const course = await courseService.getCourseFromDb({
        state: fields.state,
      });

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
        courses: '{ "1": ["Hole 1", "Hole 2", "Hole 3", "Hole 4"] }',
        tapLink: "www.google.com",
      };

      const course = await courseService.getCourseFromDb({
        state: fields.state,
      });

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

    it("should return validation error for invalid contact method for email", async () => {
      const fields = {
        state: "Alabama",
        title: "Main Ad",
        courses: '{ "1": ["Hole 1", "Hole 2", "Hole 3", "Hole 4"] }',
        tapLink: "exmaple@@",
      };

      const course = await courseService.getCourseFromDb({
        state: fields.state,
      });

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
      expect(response.body.data).toEqual("Invalid contact method");
    });

    it("should return validation error for invalid contact method for number", async () => {
      const fields = {
        state: "Alabama",
        title: "Main Ad",
        courses: '{ "1": ["Hole 1", "Hole 2", "Hole 3", "Hole 4"] }',
        tapLink: "tel:43434",
      };

      const course = await courseService.getCourseFromDb({
        state: fields.state,
      });

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
      expect(response.body.data).toEqual("Invalid contact method");
    });
    it("should return validation error if smallImage which is required is not defined", async () => {
      const fields = {
        state: "Alabama",
        title: "Main Ad",
        courses: '{ "1": ["Hole 1", "Hole 2", "Hole 3", "Hole 4"] }',
      };

      const course = await courseService.getCourseFromDb({
        state: fields.state,
      });

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
        courses: '{ "1": ["Hole 1", "Hole 2", "Hole 3", "Hole 4"] }',
        tapLink: "www.google.com",
      };

      const course = await courseService.getCourseFromDb({
        state: fields.state,
      });

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
});
