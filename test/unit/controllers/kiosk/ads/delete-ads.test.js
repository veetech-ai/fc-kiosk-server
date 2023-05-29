const helper = require("../../../../helper");
const upload_file = require("../../../../../common/upload");
const ServiceError = require("../../../../../utils/serviceError");
const adsService = require("../../../../../services/kiosk/ads");
const { uuid } = require("uuidv4");

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
  let nonExistingAdId = -1;
  let invalidAdId = "invalidId";
  let differentOrganizationCustomerToken;

  const commonAdsBody = {
    fields: {
      title: "Main Ad",
    },
    files: {
      adImage: {
        name: "mock-ad1.png",
        type: "image/png",
        size: 5000, // bytes
        path: "/mock/path/to/logo.png",
      },
    },
  };

  const invalidAdBody = {
    fields: {
      title: 1,
    },
  };

  const newAdsBody = {
    fields: {
      title: "Georgia",
    },
    files: {
      adImage: {
        name: "mock-ad2.png",
        type: "image/png",
        size: 5000, // bytes
        path: "/mock/path/to/logo.png",
      },
    },
  };

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
    const createdAd = await makeAdApi(files, fields);
    adId = createdAd.body.data.id;
  });

  const deleteAdRequest = async (id, token = adminToken) => {
    return await helper.delete_request_with_authorization({
      endpoint: `ads/${id}`,
      token: token,
    });
  };

  it("should delete a new ad info with valid input with admin or super admin token", async () => {
    const response = await deleteAdRequest(adId);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBe("Ad deleted successfully");
  });
  it("should return error while deleting the already deleted ", async () => {
    const response = await deleteAdRequest(adId);
    expect(response.body.success).toBe(false);
    expect(response.body.data).toBe("Ad not found");
  });
  it("should return an error if user other than admin or super admin access tha api", async () => {
    const response = await deleteAdRequest(nonExistingAdId);
    expect(response.body.success).toBe(false);
    expect(response.body.data).toBe("Ad not found");
  });

  it("should return an validation error", async () => {
    const expectedResponse = {
      success: false,
      data: "adId must be a valid number",
    };

    const response = await deleteAdRequest(invalidAdId);

    expect(response.body).toEqual(expectedResponse);
  });
  it("should return  error if api is accessed by entity other than super admin", async () => {
    const response = await deleteAdRequest(adId, customerToken);

    expect(response.body.success).toEqual(false);
    expect(response.body.data).toEqual("You are not allowed");
  });
});
