const { uuid } = require("uuidv4");

const helper = require("../../../../helper");
const awsS3 = require("../../../../../common/external_services/aws-s3");

const models = require("../../../../../models");
const serverUpload = require("../../../../../common/server_upload");

const { Course } = models;

let mockFields,
  mockFiles,
  testCourse,
  adminToken = null;

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

awsS3.uploadFile = jest.fn(() => Promise.resolve(uuid()));
serverUpload.upload = jest.fn(() => Promise.resolve(uuid()));

const filesData = {
  thumbnail: {
    name: "mock-logo.png",
    type: "image/png",
    size: 5000, // bytes
    path: "/mock/path/to/logo.png",
  },
  corousal: [
    {
      name: "mock-logo.png",
      type: "image/png",
      size: 5000, // bytes
      path: "/mock/path/to/logo.png",
    },
    {
      name: "mock-logo.png",
      type: "image/png",
      size: 5000, // bytes
      path: "/mock/path/to/logo.png",
    },
  ],
};

const coursePayload = {
  name: "Test course",
  state: "Test State",
  city: "Test city",
  orgId: 1,
};

const payload = {
  title: "Testing Event",
  openingTime: "10:00",
  closingTime: "12:00",
  address: "Testing Address",
  description: "This is very cool event",
  details: "<p>This is <b>cool</b> event </p>",
};

/**
 * Make post request for an event
 * @param {{fields: object, files: object[]}} options request body
 * @returns {Promise<Response>}
 */
const makePostEventRequest = (options = {}) => {
  const { fields = payload, files = filesData } = options;
  mockFields = fields;
  mockFiles = files;

  return helper.post_request_with_authorization({
    endpoint: "events",
    token: adminToken,
    params: payload,
    fileupload: true,
  });
};

describe("POST /events", () => {
  beforeAll(async () => {
    adminToken = await helper.get_token_for("admin");

    testCourse = await helper.post_request_with_authorization({
      endpoint: "kiosk-courses",
      token: adminToken,
      params: coursePayload,
    });

    testCourse = testCourse.body.data;

    payload.gcId = testCourse.id;
  });

  afterAll(async () => {
    await Course.destroy({ where: { id: testCourse.id } });
  });

  describe("success", () => {
    it("should create new event", async () => {
      const res = await makePostEventRequest();
      console.log(res.body.data.corousal);

      expect(res.body.success).toEqual(true);
      expect(res.body.data.id).toEqual(expect.any(Number));
      expect(res.body.data.title).toEqual(payload.title);
      expect(res.body.data.openingTime).toEqual(payload.openingTime);
      expect(res.body.data.closingTime).toEqual(payload.closingTime);
      expect(res.body.data.address).toEqual(payload.address);
      expect(res.body.data.description).toEqual(payload.description);
      expect(res.body.data.details).toEqual(payload.details);
      expect(res.body.data.gcId).toEqual(testCourse.id);

      expect(() => new URL(res.body.data.imageUrl)).not.toThrowError();
      if (res.body.data.corousal && res.body.data.corousal.length) {
        res.body.data.corousal.forEach((url) => {
          expect(() => new URL(url)).not.toThrowError();
        });
      }
      expect(Date.parse(res.body.data.createdAt)).not.toBeNaN();
      expect(Date.parse(res.body.data.updatedAt)).not.toBeNaN();

      expect(res.statusCode).toEqual(201);
    });
  });

  describe("failure", () => {
    it("should throw error if title is not given", async () => {
      const _payload = { ...payload };
      delete _payload["title"];
      const res = await makePostEventRequest({ fields: _payload });

      expect(res.body).toEqual({
        success: false,
        data: "The title field is required.",
      });
      expect(res.statusCode).toEqual(400);
    });
    it("should throw error if title is not valid string", async () => {
      const _payload = { ...payload };
      _payload["title"] = 45678;
      const res = await makePostEventRequest({ fields: _payload });

      expect(res.body).toEqual({
        success: false,
        data: "The title must be a string.",
      });
      expect(res.statusCode).toEqual(400);
    });

    it("should throw error if gcId is not given", async () => {
      const _payload = { ...payload };
      delete _payload["gcId"];
      const res = await makePostEventRequest({ fields: _payload });

      expect(res.body).toEqual({
        success: false,
        data: "The gcId field is required.",
      });
      expect(res.statusCode).toEqual(400);
    });
    it("should throw error if gcId is not valid numb er", async () => {
      const _payload = { ...payload };
      _payload["gcId"] = "invalid id";
      const res = await makePostEventRequest({ fields: _payload });

      expect(res.body).toEqual({
        success: false,
        data: "The gcId must be an integer.",
      });
      expect(res.statusCode).toEqual(400);
    });

    it("should throw error if openingTime is not given", async () => {
      const _payload = { ...payload };
      delete _payload["openingTime"];
      const res = await makePostEventRequest({ fields: _payload });

      expect(res.body).toEqual({
        success: false,
        data: "The openingTime field is required.",
      });
      expect(res.statusCode).toEqual(400);
    });
    it("should throw error if openingTime is not valid hour 24 format time", async () => {
      const _payload = { ...payload };
      _payload["openingTime"] = "invalid time";
      const res = await makePostEventRequest({ fields: _payload });

      expect(res.body).toEqual({
        success: false,
        data: "The openingTime format is invalid.",
      });
      expect(res.statusCode).toEqual(400);
    });

    it("should throw error if closingTime is not given", async () => {
      const _payload = { ...payload };
      delete _payload["closingTime"];
      const res = await makePostEventRequest({ fields: _payload });

      expect(res.body).toEqual({
        success: false,
        data: "The closingTime field is required.",
      });
      expect(res.statusCode).toEqual(400);
    });
    it("should throw error if closingTime is not valid hour 24 format time", async () => {
      const _payload = { ...payload };
      _payload["closingTime"] = "invalid time";
      const res = await makePostEventRequest({ fields: _payload });

      expect(res.body).toEqual({
        success: false,
        data: "The closingTime format is invalid.",
      });
      expect(res.statusCode).toEqual(400);
    });

    it("should throw error if address is not given", async () => {
      const _payload = { ...payload };
      delete _payload["address"];
      const res = await makePostEventRequest({ fields: _payload });

      expect(res.body).toEqual({
        success: false,
        data: "The address field is required.",
      });
      expect(res.statusCode).toEqual(400);
    });
    it("should throw error if address is not valid string", async () => {
      const _payload = { ...payload };
      _payload["address"] = 45678;
      const res = await makePostEventRequest({ fields: _payload });

      expect(res.body).toEqual({
        success: false,
        data: "The address must be a string.",
      });
      expect(res.statusCode).toEqual(400);
    });

    it("should throw error if details is not valid string", async () => {
      const _payload = { ...payload };
      _payload["details"] = 45678;
      const res = await makePostEventRequest({ fields: _payload });

      expect(res.body).toEqual({
        success: false,
        data: "The details must be a string.",
      });
      expect(res.statusCode).toEqual(400);
    });

    it("should throw error if description is not valid string", async () => {
      const _payload = { ...payload };
      _payload["description"] = 45678;
      const res = await makePostEventRequest({ fields: _payload });

      expect(res.body).toEqual({
        success: false,
        data: "The description must be a string.",
      });
      expect(res.statusCode).toEqual(400);
    });

    it("should throw error if thumbnail is not provided", async () => {
      delete filesData["thumbnail"];
      const res = await makePostEventRequest({ fields: payload });

      expect(res.body).toEqual({
        success: false,
        data: "The thumbnail image is required.",
      });
      expect(res.statusCode).toEqual(400);
    });

    it("should throw error if thumbnail is not of type one of: ('jpg', 'jpeg', 'png', 'webp')", async () => {
      filesData.thumbnail = {
        name: "mock-logo.svg",
        type: "image/svg",
        size: 5000, // bytes
        path: "/mock/path/to/logo.svg",
      };
      const res = await makePostEventRequest({ files: filesData });

      expect(res.body).toEqual({
        success: false,
        data: "Only jpg, jpeg, png, webp files are allowed",
      });
      expect(res.statusCode).toEqual(500);
    });

    it("should throw error if course with gcId doesn't exist", async () => {
      payload.gcId = 79853321;

      const res = await makePostEventRequest({ fields: payload });

      expect(res.body).toEqual({
        success: false,
        data: "Course not found",
      });

      expect(res.statusCode).toEqual(404);
    });
  });
});
