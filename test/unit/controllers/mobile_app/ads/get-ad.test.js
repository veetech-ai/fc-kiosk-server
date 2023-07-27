const helper = require("../../../../helper");
const upload_file = require("../../../../../common/upload");
const courseService = require("../../../../../services/mobile/courses");
const ServiceError = require("../../../../../utils/serviceError");
const adsService = require("../../../../../services/mobile/ads");

let mockFields;
let mockFiles;
let createdAd;

let adminToken;
let superAdminToken;
let courseId;
let customerToken;
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

jest
  .spyOn(upload_file, "upload_file")
  .mockImplementation(() => Promise.resolve("mock-ad-url"));

const mockFormidable = (fields, files) => {
  mockFields = fields;
  mockFiles = files;
};

async function makeAdApiRequest(params, token = adminToken) {
  return await helper.post_request_with_authorization({
    endpoint: `ads`,
    token: token,
    params: params,
  });
}

async function createAd() {
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
  createdAd = await makeAdApiRequest(fields);
}

describe("POST /api/v1/ads", () => {
  beforeAll(async () => {
    superAdminToken = await helper.get_token_for("superadmin");
    adminToken = await helper.get_token_for("admin");
    customerToken = await helper.get_token_for("testCustomer");

    await createAd();
  });

  describe("Success", () => {
    it("should get ad detail if the ad id is correct and user is admin", async () => {
      const response = await helper.get_request_with_authorization({
        endpoint: `ads/` + createdAd.body.data.id,
        token: adminToken,
      });

      const expectedResponse = expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          id: expect.any(Number),
          bigImage: null,
          smallImage: "mock-ad-url",
          tapLink: "www.google.com",
          title: "Main Ad",
          Course_Ads: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              screens: expect.arrayContaining([
                "Hole 1",
                "Hole 2",
                "Hole 3",
                "Hole 4",
              ]),
              Mobile_Courses: expect.objectContaining({
                id: expect.any(Number),
                golfbert_id: expect.any(Number),
                name: "Highland Park Golf Course",
                phone: "(205) 322 1902",
                country: "USA",
                street: "3300 Highland Ave S",
                city: "Birmingham",
                state: "Alabama",
                zip: "35205",
                lat: expect.any(Number),
                long: expect.any(Number),
              }),
            }),
          ]),
        }),
      });

      expect(response.body).toEqual(expectedResponse);
    });

    it("should get ad detail if the ad id is correct and user is super admin", async () => {
      const response = await helper.get_request_with_authorization({
        endpoint: `ads/` + createdAd.body.data.id,
        token: superAdminToken,
      });

      const expectedResponse = expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          id: expect.any(Number),
          bigImage: null,
          smallImage: "mock-ad-url",
          tapLink: "www.google.com",
          title: "Main Ad",
          Course_Ads: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              screens: expect.arrayContaining([
                "Hole 1",
                "Hole 2",
                "Hole 3",
                "Hole 4",
              ]),
              Mobile_Courses: expect.objectContaining({
                id: expect.any(Number),
                golfbert_id: expect.any(Number),
                name: "Highland Park Golf Course",
                phone: "(205) 322 1902",
                country: "USA",
                street: "3300 Highland Ave S",
                city: "Birmingham",
                state: "Alabama",
                zip: "35205",
                lat: expect.any(Number),
                long: expect.any(Number),
              }),
            }),
          ]),
        }),
      });

      expect(response.body).toEqual(expectedResponse);
    });
  });

  describe("Success", () => {
    it("should throw exception if the ad id is not number", async () => {
      const response = await helper.get_request_with_authorization({
        endpoint: `ads/abc`,
        token: adminToken,
      });

      const expectedResponse = {
        success: false,
        data: "adId must be a valid number",
      };

      expect(response.body).toEqual(expectedResponse);
    });
  });

  it("should return null if the ad id is correct", async () => {
    const response = await helper.get_request_with_authorization({
      endpoint: `ads/${-1}`,
      token: adminToken,
    });

    const expectedResponse = {
      success: true,
      data: null,
    };

    expect(response.body).toEqual(expectedResponse);
  });
});
