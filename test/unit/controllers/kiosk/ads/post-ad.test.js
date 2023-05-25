const helper = require("../../../../helper");
const upload_file = require("../../../../../common/upload");
const ServiceError = require("../../../../../utils/serviceError");

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

let mockedUploadImageCourse = jest
  .spyOn(upload_file, "uploadImageForCourse")
  .mockImplementation(() => Promise.resolve("mock-logo-url"));
const mockFormidable = (fields, files) => {
  mockFields = fields;
  mockFiles = files;
};

describe("POST /api/v1/ads", () => {
  let adminToken;
  let courseId;
  let invalidCourseId = -1;
  let orgId;
  let customerToken;
  let testOperatorToken;
  let testOrganizationId = 1;
  let differentOrganizationCustomerToken;

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
    orgId = course.body.data.orgId;
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
      gcId: courseId,
      state: "Alabama",
      title: "Main Ad",
    };

    const files = {
      adImage: {
        name: "mock-logo.png",
        type: "image/png",
        size: 5000, // bytes
        path: "/mock/path/to/logo.png",
      },
    };

    mockFormidable(fields, files);
    const response = await makeAdApiRequest(fields);
    console.log("ee :", response.body);
    expect(response.body.data.gcId).toEqual(fields.gcId);
    expect(response.body.data.state).toEqual(fields.state);
    expect(response.body.data.title).toEqual(fields.title);
  });
  it("should return error if an error occurred while image uploading", async () => {
    const fields = {
      gcId: courseId,
      state: "Alabama",
      title: "Main Ad",
    };

    const files = {
      adImage: {
        name: "mock-logo.png",
        type: "image/png",
        size: 5000, // bytes
        path: "/mock/path/to/logo.png",
      },
    };

    mockFormidable(fields, files);
    mockedUploadImageCourse.mockImplementation(() =>
      Promise.reject(new ServiceError("Something went wrong")),
    );

    const response = await makeAdApiRequest(fields);
    expect(response.body.data).toBe(errorMessage);
  });
  it("should create a new ad with the customer token who is the part of same organization", async () => {
    const fields = {
      gcId: courseId,
      state: "Alabama",
      title: "Main Ad",
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

    const response = await makeAdApiRequest(fields, customerToken);
    expect(response.body.data).toEqual("You are not allowed");
  });
  it("should return an error if user belongs to same organization but not having sufficient rights", async () => {
    const params = {};
    const response = await makeAdApiRequest(params, testOperatorToken);
    expect(response.body.data).toEqual("You are not allowed");
  });
  it("should return an error if user belongs to different organization", async () => {
    const params = {};
    const response = await makeAdApiRequest(
      params,
      differentOrganizationCustomerToken,
    );
    expect(response.body.data).toEqual("You are not allowed");
  });
  it("should throw error if courseId is invalid", async () => {
    const fields = {
      gcId: invalidCourseId,
      state: "Alabama",
      title: "Main Ad",
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

    const response = await makeAdApiRequest(fields, customerToken);
    expect(response.body.data).toEqual("You are not allowed");
  });
  it("should throw error if courseId is not defined", async () => {
    const fields = {
      gcId: undefined,
      state: "Alabama",
      title: "Main Ad",
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

    const response = await makeAdApiRequest(fields);
    expect(response.body.data.errors.gcId[0]).toEqual(
      "The gcId field is required.",
    );
  });
});
