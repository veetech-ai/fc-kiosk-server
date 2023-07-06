const helper = require("../../../../helper");
const upload_file = require("../../../../../common/upload");
const courseService = require("../../../../../services/mobile/courses");
const ServiceError = require("../../../../../utils/serviceError");
const adsService = require("../../../../../services/mobile/ads");
const models = require("../../../../../models/index");
const AdsModel = models.Ad;

let mockFields;
let mockFiles;
let course;
let fields = {
  state: "Alabama",
  title: "Main Ad",
  screens: ["Hole 1", "Hole 2", "Hole 3", "Hole 4"],
  tapLink: "www.google.com",
};

let files = {
  smallImage: {
    name: "mock-logo.png",
    type: "image/png",
    size: 5000, // bytes
    path: "/mock/path/to/logo.png",
  },
};
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

describe("Delete ads/:adId", () => {
  let adminToken;
  let courseId;
  let customerToken;

  beforeAll(async () => {
    // Create some courses for the test organization
    await AdsModel.destroy({ where: {} });
    adminToken = await helper.get_token_for("admin");
    customerToken = await helper.get_token_for("testCustomer");
  });

  afterAll(async () => {
    await adsService.deleteAd({ gcId: courseId });
  });

  const createAds = async () => {
    const where = {
      state: fields.state,
    };
    const { dataValues } = await courseService.getCourseFromDb(where);
    course = dataValues;
    courseId = course.id;
    fields.gcId = courseId;

    mockFormidable(fields, files);
    return await helper.post_request_with_authorization({
      endpoint: `ads`,
      token: adminToken,
      params: fields,
    });
  };
  describe("success", () => {
    it("should return success message if ad id is correct", async () => {
      const adCreationResponse = await createAds();
      const response = await helper.delete_request_with_authorization({
        endpoint: `ads/${adCreationResponse.body.data.id}`,
        token: adminToken,
      });
      const expectedResponse = { success: true, data: "Deleted Successfully" };
      expect(response.body).toEqual(expectedResponse);
      expect(response.statusCode).toEqual(200);
    });
  });
  describe("fail", () => {
    let adId;
    beforeAll(async () => {
      const adCreationResponse = await createAds();
      adId = adCreationResponse.body.data.id;
    });
    it("should throw exception if ad id is not correct", async () => {
      const response = await helper.delete_request_with_authorization({
        endpoint: `ads/${-adId}`,
        token: adminToken,
      });
      const expectedResponse = { success: false, data: "Ad not found" };
      expect(response.body).toEqual(expectedResponse);
      expect(response.statusCode).toEqual(404);
    });

    it("should throw exception if user not have admin rights", async () => {
      const response = await helper.delete_request_with_authorization({
        endpoint: `ads/${adId}`,
        token: customerToken,
      });
      const expectedResponse = { success: false, data: "You are not allowed" };
      expect(response.body).toEqual(expectedResponse);
      expect(response.statusCode).toEqual(403);
    });

    it("should throw exception if ad id is invalid(not number)", async () => {
      const response = await helper.delete_request_with_authorization({
        endpoint: `ads/ads`,
        token: adminToken,
      });
      const expectedResponse = {
        success: false,
        data: "adId must be a valid number",
      };
      expect(response.body).toEqual(expectedResponse);
      expect(response.statusCode).toEqual(400);
    });
  });
});
