const helper = require("../../../../helper");
const upload_file = require("../../../../../common/upload");
const courseService = require("../../../../../services/mobile/courses");
const ServiceError = require("../../../../../utils/serviceError");
const adsService = require("../../../../../services/mobile/ads");

let mockFields;
let mockFiles;
let courseId;
let fields = {
  state: "Alabama",
  title: "Main Ad",
  screens: ["Hole 18"],
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
let createdAd;
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

describe("PATCH /api/v1/ads/{adId}", () => {
  let adminToken;
  let customerToken;
  const createAd = async () => {
    mockFormidable(fields, files);
    const adCreationResponse = await helper.post_request_with_authorization({
      endpoint: `ads`,
      token: adminToken,
      params: fields,
    });
    return adCreationResponse.body.data;
  };
  beforeAll(async () => {
    // Create some courses for the test organization
    await adsService.deleteAd({});
    adminToken = await helper.get_token_for("admin");
    customerToken = await helper.get_token_for("testCustomer");
    const course = await courseService.getCourseFromDb({ state: fields.state });
    fields.gcId = course.id;
    createdAd = await createAd();
  });
  afterAll(async () => {
    await adsService.deleteAd({ id: createdAd.id });
  });

  const updateAdApiRequest = async (adId, params, token = adminToken) => {
    return await helper.patch_request_with_authorization({
      endpoint: `ads/${adId}`,
      token: token,
      params: params,
    });
  };

  it("should successfully update the ad with given body", async () => {
    const fields = {
      state: "Missisipi",
      title: "Secondary Ad",
      screens: ["Hole 1", "Hole 2", "Hole 3"],
      tapLink: "www.yahoo.com",
    };

    const expectedResponse = {
      success: true,
      data: "Updated Successfuly",
    };

    mockFormidable(fields, files);
    const response = await updateAdApiRequest(createdAd.id, fields);
    expect(response.body).toEqual(expectedResponse);
  });
  it("should return error with invalid adId", async () => {
    let nonexistingAdId = -1;
    const fields = {
      state: "Mobile",
      title: "Main Ad",
      screens: ["Hole 4"],
      tapLink: "www.google.com",
    };
    const expectedResponse = {
      success: false,
      data: "Ad not found",
    };
    const response = await updateAdApiRequest(nonexistingAdId, fields);
    expect(response.body).toEqual(expectedResponse);
  });
  it("should return error with invalid adId", async () => {
    let invalidAdId = "aa";
    const expectedResponse = {
      success: false,
      data: "adId must be a valid number",
    };
    const response = await updateAdApiRequest(invalidAdId, fields);
    expect(response.body).toEqual(expectedResponse);
  });
  it("should return validation error if both both tapLink and bigImage is populated. In below case the ad which we are trying to update already has tapLink but when we update it with bigImage it should give error as both cannot be populated for same instance", async () => {
    const expectedResponse = {
      success: false,
      data: "Validation error: Both bigImage and tapLink cannot be populated at the same time.",
    };
    const fields = {
      state: "Alabama",
      title: "Main Ad",
      screens: ["Hole 5"],
    };
    const files = {
      bigImage: {
        name: "mock-bigImage.png",
        type: "image/png",
        size: 5000, // bytes
      },
    };

    mockFormidable(fields, files);
    const response = await updateAdApiRequest(createdAd.id, fields);
    expect(response.body).toEqual(expectedResponse);
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
    const files = {
      smallImage: {
        name: "mock-bigImage.png",
        type: "image/png",
        size: 5000, // bytes
      },
    };

    mockFormidable(fields, files);
    const response = await updateAdApiRequest(createdAd.id, fields);
    expect(response.body).toEqual(expectedResponse);
  });
  it("should return error if screens given by user are already occupied", async () => {
    const expectedResponse = {
      success: true,
      data: "Updated Successfuly",
    };
    const fields = {
      state: "Alabama",
      title: "Main Ad",
      screens: ["Hole 1", "Hole 2", "Hole 3"],
    };
    const files = {
      smallImage: {
        name: "mock-bigImage.png",
        type: "image/png",
        size: 5000, // bytes
      },
    };

    mockFormidable(fields, files);
    const response = await updateAdApiRequest(createdAd.id, fields);
    expect(response.body).toEqual(expectedResponse);
  });
  it("should return error if contact method is invalid", async () => {
    const fields = {
      state: "Missisipi",
      title: "Secondary Ad",
      screens: ["Hole 15"],
      tapLink: "yahoo",
    };

    const expectedResponse = {
      success: false,
      data: "Invalid contact method",
    };

    mockFormidable(fields, files);
    const response = await updateAdApiRequest(createdAd.id, fields);
    expect(response.body).toEqual(expectedResponse);
  });
  it("should return error if contact method is invalid", async () => {
    const fields = {
      state: "Missisipi",
      title: "Secondary Ad",
      screens: ["Hole 15"],
      tapLink: "12333",
    };

    const expectedResponse = {
      success: false,
      data: "Invalid contact method",
    };

    mockFormidable(fields, files);
    const response = await updateAdApiRequest(createdAd.id, fields);
    expect(response.body).toEqual(expectedResponse);
  });
  it("should update succesfully if contact method  is valid", async () => {
    const fields = {
      state: "Missisipi",
      title: "Secondary Ad",
      screens: ["Hole 15"],
      tapLink: "tel:1236556565",
    };

    const expectedResponse = {
      success: true,
      data: "Updated Successfuly",
    };

    mockFormidable(fields, files);
    const response = await updateAdApiRequest(createdAd.id, fields);
    expect(response.body).toEqual(expectedResponse);
  });
  it("should update succesfully if contact method is valid", async () => {
    const fields = {
      state: "Missisipi",
      title: "Secondary Ad",
      screens: ["Hole 15"],
      tapLink: "mailto:exmaple@gmail.com",
    };

    const expectedResponse = {
      success: true,
      data: "Updated Successfuly",
    };

    mockFormidable(fields, files);
    const response = await updateAdApiRequest(createdAd.id, fields);
    expect(response.body).toEqual(expectedResponse);
  });
  it("should return validation error in case of invalid input for screens", async () => {
    const fields = {
      state: "Alabama",
      title: "Main Ad",
      screens: "Hole 17",
      tapLink: "www.google.com",
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
    const response = await updateAdApiRequest(createdAd.id, fields);
    expect(response.body).toEqual(expectedResponse);
  });
  it("should return validation error if api is accessed by the user other than admin", async () => {
    const expectedResponse = {
      success: false,
      data: "You are not allowed",
    };
    const response = await updateAdApiRequest(createdAd.id, {}, customerToken);
    expect(response.body).toEqual(expectedResponse);
  });
  it("should return error if an error occurred while image uploading", async () => {
    const expectedResponse = {
      success: false,
      data: errorMessage,
    };
    const fields = {
      state: "Missisipi",
      title: "Secondary Ad",
      screens: ["Hole 6", "Hole 8"],
      tapLink: "www.yahoo.com",
    };

    mockFormidable(fields, files);
    mockedFileUpload.mockImplementation(() =>
      Promise.reject(new ServiceError("Something went wrong")),
    );

    const response = await updateAdApiRequest(createdAd.id, fields);
    expect(response.body).toEqual(expectedResponse);
  });
});
