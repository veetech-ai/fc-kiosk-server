const helper = require("../../../../helper");
const upload_file = require("../../../../../common/upload");
const courseService = require("../../../../../services/mobile/courses");
const ServiceError = require("../../../../../utils/serviceError");
const adsService = require("../../../../../services/mobile/ads");

let mockFields;
let mockFiles;

let fields = {
  state: "Alabama",
  title: "Main Ad",
  courses: '{ "1": ["Hole 1", "Hole 2", "Hole 3"] }',
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

  describe("Success", () => {
    it("should successfully update the ad with given body", async () => {
      const fields = {
        state: "Missisipi",
        title: "Secondary Ad",
        courses: '{ "1": ["Hole 1", "Hole 2", "Hole 3"] }',
        tapLink: "www.yahoo.com",
      };

      const expectedResponse = {
        success: true,
        data: "Record is updated successfully",
      };

      mockFormidable(fields, files);

      const response = await updateAdApiRequest(createdAd.id, fields);

      expect(response.body).toEqual(expectedResponse);
    });

    it("should update succesfully if contact method  is valid", async () => {
      const fields = {
        state: "Missisipi",
        title: "Secondary Ad",
        courses: '{"1": ["Hole 5"]}',
        tapLink: "tel:1236556565",
      };

      const expectedResponse = {
        success: true,
        data: "Record is updated successfully",
      };

      mockFormidable(fields, files);
      const response = await updateAdApiRequest(createdAd.id, fields);
      expect(response.body).toEqual(expectedResponse);
    });

    it("should update succesfully if contact method is valid", async () => {
      const fields = {
        state: "Missisipi",
        title: "Secondary Ad",
        courses: '{"1": ["Hole 5"]}',
        tapLink: "mailto:exmaple@gmail.com",
      };

      const expectedResponse = {
        success: true,
        data: "Record is updated successfully",
      };

      mockFormidable(fields, files);
      const response = await updateAdApiRequest(createdAd.id, fields);
      expect(response.body).toEqual(expectedResponse);
    });

    it("should delete rows with gcId from Course_Ads which are not in the req payload", async () => {
      const creationFields = {
        state: "Missisipi",
        title: "Secondary Ad",
        courses: '{"1": ["Hole 5"], "2": ["Hole 1"]}',
        tapLink: "mailto:exmaple@gmail.com",
      };
      mockFormidable(creationFields, files);
      const adResponse = await helper.post_request_with_authorization({
        endpoint: `ads`,
        token: adminToken,
        params: creationFields,
      });

      const udpationFields = {
        state: "Missisipi",
        title: "Secondary Ad",
        courses: '{"1": ["Hole 5", "Scorecard"]}',
        tapLink: "mailto:exmaple@gmail.com",
      };

      const expectedResponse = {
        success: true,
        data: "Record is updated successfully",
      };

      mockFormidable(udpationFields, files);
      const response = await updateAdApiRequest(
        adResponse.body.data.id,
        udpationFields,
      );

      expect(response.body).toEqual(expectedResponse);

      const result = await helper.get_request_with_authorization({
        endpoint: `ads/${adResponse.body.data.id}`,
        token: adminToken,
      });

      expect(result.body.data.Course_Ads.length).toEqual(1);
    });
  });

  describe("Failure", () => {
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
      const expectedResponse = {
        success: false,
        data: "adId must be a valid number",
      };

      const response = await updateAdApiRequest("abc", fields);
      expect(response.body).toEqual(expectedResponse);

      const response1 = await updateAdApiRequest("12dd", fields);
      expect(response1.body).toEqual(expectedResponse);

      const response3 = await updateAdApiRequest(null, fields);
      expect(response3.body).toEqual(expectedResponse);
    });

    it("should return validation error if both both tapLink and bigImage is populated. In below case the ad which we are trying to update already has tapLink but when we update it with bigImage it should give error as both cannot be populated for same instance", async () => {
      const expectedResponse = {
        success: false,
        data: "Validation error: Both bigImage and tapLink cannot be populated at the same time.",
      };

      const fields = {
        state: "Alabama",
        title: "Main Ad",
        tapLink: "www.youtube.com",
        courses: '{"1": ["Hole 5"]}',
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
        tapLink: "www.youtube.com",
        courses: '{"1": ["Invalid Screen"]}',
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
        courses: '{"1": ["Hole 5"]}',
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
        courses: '{"1", ["Hole 5"]}',
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
    it("should return validation error if api is accessed by the user other than admin", async () => {
      const expectedResponse = {
        success: false,
        data: "You are not allowed",
      };
      const response = await updateAdApiRequest(
        createdAd.id,
        {},
        customerToken,
      );
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
        courses: '{"1": ["Hole 5"]}',
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
});
