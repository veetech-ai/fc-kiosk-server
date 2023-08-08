const helper = require("../../../../helper");
const upload_file = require("../../../../../common/upload");

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

// upload_file.upload_file = jest.fn(() => Promise.resolve("mock-logo-url"));

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

const makePostEventRequest = (options = {}) => {
  const { fields = payload, files = filesData } = options;
  mockFields = fields;
  mockFiles = files;

  return helper.post_request_with_authorization({
    endpoint: "events",
    token: adminToken,
    params: payload,
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

  describe("success", () => {
    it.only("should create new event", async () => {
      const res = await makePostEventRequest();

      expect(res.body).toEqual({
        success: true,
        data: {
          id: expect.any(Number),
          imageUrl: expect.any(URL),
          openingTime: "10:00:00",
          closingTime: "12:00:00",
          address: expect.any(String),
          corousal: expect.arrayContaining([expect.any(URL)]),
          description: expect.any(String),
          details: expect.any(String),
        },
      });
    });
  });

  describe("failure", () => {
    it("should throw error if title is not given", async () => {
      const _payload = payload;
      delete _payload["title"];
      const res = await makePostEventRequest({ fields: _payload });

      expect(res.body).toEqual({
        success: false,
        data: "The title field is required",
      });
      expect(res.statusCode).toEqual(400);
    });
    it("should throw error if title is not valid string", async () => {
      const _payload = payload;
      _payload["title"] = 45678;
      const res = await makePostEventRequest({ fields: _payload });

      expect(res.body).toEqual({
        success: false,
        data: "The title field is not a valid string",
      });
      expect(res.statusCode).toEqual(400);
    });

    it("should throw error if gcId is not given", async () => {
      const _payload = payload;
      delete _payload["gcId"];
      const res = await makePostEventRequest({ fields: _payload });

      expect(res.body).toEqual({
        success: false,
        data: "The gcId field is required",
      });
      expect(res.statusCode).toEqual(400);
    });
    it("should throw error if gcId is not valid numb er", async () => {
      const _payload = payload;
      _payload["gcId"] = "invalid id";
      const res = await makePostEventRequest({ fields: _payload });

      expect(res.body).toEqual({
        success: false,
        data: "The gcId field is not a valid integer",
      });
      expect(res.statusCode).toEqual(400);
    });

    it("should throw error if openingTime is not given", async () => {
      const _payload = payload;
      delete _payload["openingTime"];
      const res = await makePostEventRequest({ fields: _payload });

      expect(res.body).toEqual({
        success: false,
        data: "The openingTime field is required",
      });
      expect(res.statusCode).toEqual(400);
    });
    it("should throw error if openingTime is not valid hour 24 format time", async () => {
      const _payload = payload;
      _payload["openingTime"] = "invalid time";
      const res = await makePostEventRequest({ fields: _payload });

      expect(res.body).toEqual({
        success: false,
        data: "The openingTime field is not a hour 24 format time",
      });
      expect(res.statusCode).toEqual(400);
    });

    it("should throw error if closingTime is not given", async () => {
      const _payload = payload;
      delete _payload["closingTime"];
      const res = await makePostEventRequest({ fields: _payload });

      expect(res.body).toEqual({
        success: false,
        data: "The closingTime field is required",
      });
      expect(res.statusCode).toEqual(400);
    });
    it("should throw error if closingTime is not valid hour 24 format time", async () => {
      const _payload = payload;
      _payload["closingTime"] = "invalid time";
      const res = await makePostEventRequest({ fields: _payload });

      expect(res.body).toEqual({
        success: false,
        data: "The closingTime field is not a hour 24 format time",
      });
      expect(res.statusCode).toEqual(400);
    });

    it("should throw error if address is not given", async () => {
      const _payload = payload;
      delete _payload["address"];
      const res = await makePostEventRequest({ fields: _payload });

      expect(res.body).toEqual({
        success: false,
        data: "The address field is required",
      });
      expect(res.statusCode).toEqual(400);
    });
    it("should throw error if address is not valid string", async () => {
      const _payload = payload;
      _payload["address"] = 45678;
      const res = await makePostEventRequest({ fields: _payload });

      expect(res.body).toEqual({
        success: false,
        data: "The address field is not a valid string",
      });
      expect(res.statusCode).toEqual(400);
    });

    it("should throw error if details is not valid string", async () => {
      const _payload = payload;
      _payload["details"] = 45678;
      const res = await makePostEventRequest({ fields: _payload });

      expect(res.body).toEqual({
        success: false,
        data: "The details field is not a valid string",
      });
      expect(res.statusCode).toEqual(400);
    });

    it("should throw error if description is not valid string", async () => {
      const _payload = payload;
      _payload["description"] = 45678;
      const res = await makePostEventRequest({ fields: _payload });

      expect(res.body).toEqual({
        success: false,
        data: "The description field is not a valid string",
      });
      expect(res.statusCode).toEqual(400);
    });

    it("should throw error if thumbnail is not provided", async () => {});
    it("should throw error if thumbnail is not a valid image", async () => {});

    it("should throw error if course with gcId doesn't exist", async () => {});
  });
});
