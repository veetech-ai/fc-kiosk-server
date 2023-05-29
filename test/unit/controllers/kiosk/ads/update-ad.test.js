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
  let invalidateId = "invalidate gcId";
  let differentOrganizationCustomerToken;

  const commonAdsBody={
    fields:{
      title: "Main Ad",
    },
    files:{
      adImage: {
        name: "mock-ad1.png",
        type: "image/png",
        size: 5000, // bytes
        path: "/mock/path/to/logo.png",
      }
    }
  }

  const invalidAdBody={
    fields:{
      title:1
    }
  }

  const newAdsBody={
      title: "Main Ad",
      smallImage:uuid()
  }

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

  const makeApiRequest = async (id, params, token = adminToken) => {
    return await helper.patch_request_with_authorization({
      endpoint: `ads/${id}`,
      params,
      token: token,
    });
  };

  it("should create a new ad info with valid input with admin or super admin token", async () => {

    let expectedObject = {};

    mockFormidable(commonAdsBody.fields, commonAdsBody.files);
    const response = await makeApiRequest(adId, fields);
    const ad = await adsService.getAds({ id: adId });
    expectedObject = { ...ad[0].dataValues };
    fields.smallImage = expectedObject.smallImage;
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBe("Ad updated successfully");
    expect(expectedObject).toEqual(expect.objectContaining(expectedObject));
    await adsService.updateAd(adId,newAdsBody)
  });
  it("should not update the api with empty request body", async () => {
    const fields = {};

    const files = {};

    mockFormidable(fields, files);

    const response = await makeApiRequest(adId, fields);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBe("Ad already up to date");
  });
  it("should return an error if user other than admin or super admin access tha api", async () => {

    const response = await makeApiRequest(adId, commonAdsBody.fields, customerToken);
    expect(response.body.success).toBe(false);
    expect(response.body.data).toEqual("You are not allowed");
  });

  it("should return an validation error", async () => {
    const expectedResponse = {
      success: false,
      data: {
        errors: {
          title: ["The title must be a string."],
        },
      },
    };
   
    mockFormidable(invalidAdBody.fields)
    const response = await makeApiRequest(adId, invalidAdBody);
    expect(response.body).toEqual(expectedResponse)
    expect(response.status).toEqual(400)
  });

});
