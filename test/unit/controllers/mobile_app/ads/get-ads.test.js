const helper = require("../../../../helper");
const upload_file = require("../../../../../common/upload");
const courseService = require("../../../../../services/mobile/courses");
const ServiceError = require("../../../../../utils/serviceError");
const adsService = require("../../../../../services/mobile/ads");

let mockFields;
let mockFiles;
let adId;
let course;
let fields = {
  state: "Alabama",
  title: "Main Ad",
  screens: ["Hole 1", "Hole 2", "Hole 3", "Hole 4"],
  tapLink: "google.com",
};

let files = {
  smallImage: {
    name: "mock-logo.png",
    type: "image/png",
    size: 5000, // bytes
    path: "/mock/path/to/logo.png",
  },
};
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

describe("GET /api/v1/ads", () => {
  let adminToken;
  let courseId;
  let customerToken;

  beforeAll(async () => {
    // Create some courses for the test organization

    adminToken = await helper.get_token_for("admin");
    customerToken = await helper.get_token_for("testCustomer");
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
    const response = await createAds();
    adId = response.body.data.id;
  });
  const makegetAdApi = (params, token = adminToken) => {
    return helper.get_request_with_authorization({
      endpoint: `ads`,
      token: token,
      queryParams: params,
    });
  };

  it("should return array of all ads if no param is defined", async () => {
    const expectedResponse = {
      success: true,
      data: [
        {
          id: expect.any(Number),
          smallImage: expect.any(String),
          gcId: fields.gcId,
          title: fields.title,
          screens: fields.screens,
          tapLink: fields.tapLink,
          bigImage: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          Golf_Course: {
            name: course.name,
          },
        },
      ],
    };

    const response = await makegetAdApi();
    expect(response.body).toEqual(expectedResponse);
  });
  it("should return course on the basis of gcId param", async () => {
    const expectedResponse = {
      success: true,
      data: [
        {
          id: expect.any(Number),
          smallImage: expect.any(String),
          gcId: fields.gcId,
          title: fields.title,
          screens: fields.screens,
          tapLink: fields.tapLink,
          bigImage: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          Golf_Course: {
            name: course.name,
          },
        },
      ],
    };

    const response = await makegetAdApi({ gcId: courseId });
    expect(response.body).toEqual(expectedResponse);
    await adsService.deleteAd({ id: adId });
  });
  it("should return empty array if no ad is present", async () => {
    const expectedResponse = {
      success: true,
      data: [],
    };

    const response = await makegetAdApi();
    expect(response.body).toEqual(expectedResponse);
  });
});
