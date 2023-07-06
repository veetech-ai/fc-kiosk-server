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

jest
  .spyOn(upload_file, "upload_file")
  .mockImplementation(() => Promise.resolve("mock-ad-url"));
const mockFormidable = (fields, files) => {
  mockFields = fields;
  mockFiles = files;
};

describe("GET /api/v1/ads", () => {
  let adminToken;
  let courseId;

  beforeAll(async () => {
    // Create some courses for the test organization
    await AdsModel.destroy({ where: {} });
    adminToken = await helper.get_token_for("admin");
  });
  const createAds = async (gcId, inputFields, inputFiles) => {
    let mockFields, mockFiles;
    const where = {
      state: fields.state,
    };
    const { dataValues } = await courseService.getCourseFromDb(where);
    course = dataValues;
    courseId = course.id;
    fields.gcId = gcId || courseId;
    mockFields = fields;
    mockFiles = files;
    if (inputFields) {
      mockFields = inputFields;
      mockFields.gcId = gcId || courseId;
    }
    if (inputFiles) {
      mockFiles = inputFiles;
    }
    mockFormidable(mockFields, mockFiles);
    return await helper.post_request_with_authorization({
      endpoint: `ads`,
      token: adminToken,
      params: fields,
    });
  };
  const makegetAdApi = (params, token = adminToken) => {
    return helper.get_request_with_authorization({
      endpoint: `ads`,
      token: token,
      queryParams: params,
    });
  };
  describe("Without Pagination", () => {
    it("should return array of all ads if no param is defined", async () => {
      const adCreationResponse = await createAds();
      const adsCount = await AdsModel.count();
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
              state: course.state,
            },
          },
        ],
      };

      const response = await makegetAdApi();
      const totalRecords = parseInt(response.headers["total-records"]);

      await adsService.deleteAd({ id: adCreationResponse.body.data.id });
      expect(response.body).toEqual(expectedResponse);
      expect(totalRecords).toEqual(adsCount);
    });
    it("should return course on the basis of gcId param", async () => {
      const adCreationResponse = await createAds();
      const adsCount = await AdsModel.count();
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
              state: course.state,
            },
          },
        ],
      };
      const response = await makegetAdApi({ gcId: courseId });
      const totalRecords = parseInt(response.headers["total-records"]);
      await adsService.deleteAd({ id: adCreationResponse.body.data.id });
      expect(response.body).toEqual(expectedResponse);
      expect(totalRecords).toEqual(adsCount);
    });
    it("should return empty array if no ad is present", async () => {
      const expectedResponse = {
        success: true,
        data: [],
      };
      const adsCount = await AdsModel.count();
      const response = await makegetAdApi();
      const totalRecords = parseInt(response.headers["total-records"]);
      expect(response.body).toEqual(expectedResponse);
      expect(totalRecords).toEqual(adsCount);
    });
  });

  describe("With Pagination", () => {
    const totalCoursesLength = 11;
    beforeAll(async () => {
      for (let i = 0; i < totalCoursesLength; i++) {
        const response = await createAds(i + 1);
      }
    });
    it("should return valid paginated results", async () => {
      const params = {
        where: {},
        pageNumber: 3,
        pageSize: 5,
      };
      const offset = (params.pageNumber - 1) * params.pageSize;
      const expectedResultLength =
        totalCoursesLength - offset || totalCoursesLength;
      const response = await makegetAdApi(params);
      expect(response.body.data.length).toEqual(expectedResultLength);
    });
    it("should return valid results if pagination params are not defined", async () => {
      const params = {
        where: {},
        pageNumber: undefined,
        pageSize: undefined,
      };
      const offset = (params.pageNumber - 1) * params.pageSize;
      const expectedResultLength =
        totalCoursesLength - offset || totalCoursesLength;
      const response = await makegetAdApi(params);
      expect(response.body.data.length).toEqual(expectedResultLength);
    });
  });

  describe("Searched Query Results", () => {
    const inputs = [
      {
        state: "Alabama",
        title: "Main Ad",
        screens: ["Hole 1"],
        tapLink: "www.google.com",
      },
      {
        state: "Georgia",
        title: "Secondary Ad",
        screens: ["Hole 2"],
        tapLink: "www.google.com",
      },
      {
        state: "Missisipi",
        title: "Primary Ad",
        screens: ["Hole 3"],
        tapLink: "www.google.com",
      },
      {
        state: "New York",
        title: "Main Ad",
        screens: ["Hole 4"],
        tapLink: "www.google.com",
      },
    ];
    beforeAll(async () => {
      let count = 1;
      await AdsModel.destroy({ where: {} });
      for await (const input of inputs) {
        const response = await createAds(count, input);
        count++;
      }
    });
    it("should return results if the searched term matches the records", async () => {
      const params = {
        where: {},
        search: "Main",
      };

      const response = await makegetAdApi(params);
      const expectedResult = inputs.filter((item) => {
        // Check if any attribute of the item matches the term params.search
        return Object.values(item).some((value) => {
          if (typeof value === "string") {
            return value.includes(params.search);
          }
          if (Array.isArray(value)) {
            return value.some((element) => element.includes("Main"));
          }
          return false;
        });
      });

      expect(response.body.data.length).toEqual(expectedResult.length);
    });
    it("should return empty result if the searched term does not match the records", async () => {
      const params = {
        where: {},
        search: "Jun",
      };

      const response = await makegetAdApi(params);
      const expectedResult = inputs.filter((item) => {
        // Check if any attribute of the item matches the term params.search
        return Object.values(item).some((value) => {
          if (typeof value === "string") {
            return value.includes(params.search);
          }
          if (Array.isArray(value)) {
            return value.some((element) => element.includes(params.search));
          }
          return false;
        });
      });
      expect(response.body.data.length).toEqual(expectedResult.length);
    });
    it("should return empty result if the searched term and golf course does not match the records", async () => {
      const params = {
        where: { gcId: 1 },
        search: "Jun",
      };

      const incrementedInputs = inputs.map((input, index) => {
        return {
          ...input,
          gcId: index + 1,
        };
      });

      const response = await makegetAdApi(params);
      const expectedResult = incrementedInputs.filter((item) => {
        // Check if any attribute of the item matches the term params.search
        return Object.values(item).some((value) => {
          if (typeof value === "string") {
            return (
              value.includes(params.search) && value.includes(params.where.gcId)
            );
          }
          if (Array.isArray(value)) {
            return value.some((element) => {
              return (
                element.includes(params.search) &&
                element.includes(params.where.gcId)
              );
            });
          }
          return false;
        });
      });

      expect(response.body.data.length).toEqual(expectedResult.length);
    });
  });
});
