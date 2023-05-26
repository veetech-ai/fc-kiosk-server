const helper = require("../../../../helper");
const upload_file = require("../../../../../common/upload");
const ServiceError = require("../../../../../utils/serviceError");
const adsService = require("../../../../../services/kiosk/ads");

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

describe("PATCH /api/v1/ads/{adId}", () => {
  let adminToken;
  let courseId;
  let invalidCourseId = -1;
  let orgId;
  let customerToken;
  let testOperatorToken;
  let testOrganizationId = 1;
  let adId;
  let invalidateId = "invalidate gcId";
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
    const makeAdApi = async (fields, files) => {
      fields.gcId = courseId;
      mockFormidable(fields, files);
      return await helper.post_request_with_authorization({
        endpoint: `ads`,
        token: adminToken,
        params: fields,
      });
    };
    const createdAd = await makeAdApi(files, fields);
    adId = createdAd.body.data.id;
  });

  const makeApiRequest = async (id, params, token = adminToken) => {
    return await helper.patch_request_with_authorization({
      endpoint: `ads/${id}`,
      params,
      token: token,
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
    let expectedObject = {};

    mockFormidable(fields, files);
    const response = await makeApiRequest(adId, fields);
    const ad = await adsService.getAds({ id: adId });
    expectedObject = { ...ad[0].dataValues };
    fields.smallImage = expectedObject.smallImage;
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBe("Ad updated successfully");
    expect(expectedObject).toMatchObject(fields);
  });
  it("should not update the api with emtey request body", async () => {
    const fields = {};

    const files = {};

    mockFormidable(fields, files);

    const response = await makeApiRequest(adId, fields);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBe("Ad already up to date");
  });
  it("should return an error if user other than addmin or super admin access tha api", async () => {
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
    const response = await makeApiRequest(adId, fields, customerToken);
    expect(response.body.success).toBe(false);
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

    const response = await makeApiRequest(adId, fields);
    expect(response.body.success).toBe(false);
    expect(response.body.data).toEqual("course not found");
  });
  it("should throw error if courseId is invalid", async () => {
    const fields = {
      gcId: invalidateId,
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

    const response = await makeApiRequest(adId, fields);
    expect(response.body.success).toBe(false);
    expect(response.body.data.errors.gcId[0]).toEqual(
      "The gcId must be an integer.",
    );
  });
});
