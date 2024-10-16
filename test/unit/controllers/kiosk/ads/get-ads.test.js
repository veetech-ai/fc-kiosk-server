const helper = require("../../../../helper");
const upload_file = require("../../../../../common/upload");
const courseService = require("../../../../../services/kiosk/course");
const screensService = require("../../../../../services/screenConfig/screens");
const ServiceError = require("../../../../../utils/serviceError");

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
let fields = {
  state: "Alabama",
  title: "Main Ad",
};

let files = {
  adImage: {
    name: "mock-logo.png",
    type: "image/png",
    size: 5000, // bytes
    path: "/mock/path/to/logo.png",
  },
};
jest
  .spyOn(upload_file, "uploadImageForCourse")
  .mockImplementation(() => Promise.resolve("mock-logo-url"));
const mockFormidable = (fields, files) => {
  mockFields = fields;
  mockFiles = files;
};

describe("GET /api/v1/ads", () => {
  let adminToken;
  let courseId;
  let customerToken;
  let testOperatorToken;
  let testOrganizationId = 1;
  let differentOrganizationCustomerToken;
  let createdAd;
  let linkedCourse;
  let screensData;
  let linkedScreens;
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
    const makeAdApi = async (fields, files) => {
      fields.gcId = courseId;
      mockFormidable(fields, files);
      return await helper.post_request_with_authorization({
        endpoint: `ads`,
        token: adminToken,
        params: fields,
      });
    };
    createdAd = await makeAdApi(fields, files);
    linkedCourse = await courseService.getOne({ id: createdAd.body.data.gcId });
    screensData = await screensService.getScreensByCourses(
      createdAd.body.data.gcId,
    );
    const { id, gcId, orgId, createdAt, updatedAt, ...restFields } =
      screensData.dataValues;
    linkedScreens = Object.keys(restFields).filter(
      (key) => restFields[key] === true,
    );
  });
  const makegetApiRequest = async (token = adminToken) => {
    return await helper.get_request_with_authorization({
      endpoint: `ads`,
      token: token,
    });
  };

  it("should lists ads with admin or super admin token", async () => {
    const expectedObject = {
      gcId: createdAd.body.data.gcId,
      state: createdAd.body.data.state,
      title: createdAd.body.data.title,
      smallImage: expect.any(String),
      Course: {
        name: linkedCourse.name,
      },
      screens: linkedScreens,
    };
    const response = await makegetApiRequest();
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(
      expect.arrayContaining([expect.objectContaining(expectedObject)]),
    );
  });
  it("should return error with the customer token who is the part of same organization", async () => {
    const response = await makegetApiRequest(customerToken);
    expect(response.body.data).toEqual("You are not allowed");
    expect(response.body.success).toBe(false);
  });
  it("should return an error if user belongs to same organization but not having sufficient rights", async () => {
    const response = await makegetApiRequest(testOperatorToken);
    expect(response.body.data).toEqual("You are not allowed");
    expect(response.body.success).toBe(false);
  });
  it("should return an error if user belongs to different organization", async () => {
    const response = await makegetApiRequest(
      differentOrganizationCustomerToken,
    );
    expect(response.body.data).toEqual("You are not allowed");
    expect(response.body.success).toBe(false);
  });
});
