const { uuid } = require("uuidv4");

const helper = require("../../../../helper");
const awsS3 = require("../../../../../common/external_services/aws-s3");

const models = require("../../../../../models");
const serverUpload = require("../../../../../common/server_upload");
const config = require("../../../../../config/config");

const { Course } = models;

let mockFields,
  mockFiles,
  testCourse,
  testEvent,
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
 * Make patch request for an event
 * @param {{id: number, fields: object, files: object[]}} options request body
 * @returns {Promise<Response>}
 */
const makePatchEventRequest = (options = {}) => {
  const { id = 1, fields = payload, files = filesData } = options;
  mockFields = fields;
  mockFiles = files;

  return helper.patch_request_with_authorization({
    endpoint: `events/${id}`,
    token: adminToken,
    params: fields,
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

    mockFields = payload;
    mockFiles = filesData;

    testEvent = await helper.post_request_with_authorization({
      endpoint: "events",
      token: adminToken,
      params: payload,
      fileupload: true,
    });

    testEvent = testEvent.body.data;
  });

  afterAll(async () => {
    await Course.destroy({ where: { id: testCourse.id } });
    await helper.delete_request_with_authorization({
      endpoint: `events/${testEvent.id}`,
      token: adminToken,
    });
  });

  describe("success", () => {
    it("should update an existing event", async () => {
      const updationPayload = {
        title: "Updated title",
        openingTime: "15:00",
        closingTime: "23:00",
      };
      const res = await makePatchEventRequest({
        id: testEvent.id,
        fields: updationPayload,
        files: {},
      });

      expect(res.body.success).toEqual(true);

      expect(res.statusCode).toEqual(200);

      const updatedEvent = await helper.get_request_with_authorization({
        endpoint: `events/${testEvent.id}`,
        token: adminToken,
      });

      expect(updatedEvent.body.data.id).toEqual(testCourse.id);
      expect(updatedEvent.body.data.title).toEqual(updationPayload.title);
      expect(updatedEvent.body.data.openingTime).toEqual("15:00:00");
      expect(updatedEvent.body.data.closingTime).toEqual("23:00:00");
      expect(updatedEvent.body.data.address).toEqual(payload.address);
      expect(updatedEvent.body.data.description).toEqual(payload.description);
      expect(updatedEvent.body.data.details).toEqual(payload.details);
      expect(updatedEvent.body.data.gcId).toEqual(testCourse.id);

      expect(() => new URL(updatedEvent.body.data.imageUrl)).not.toThrowError();
      if (
        updatedEvent.body.data.corousal &&
        updatedEvent.body.data.corousal.length
      ) {
        updatedEvent.body.data.corousal.forEach((url) => {
          expect(() => new URL(url)).not.toThrowError();
        });
      }
    });

    it("should not update the corousal images of an event, if both files.corousal and fields.corousalUrls are null", async () => {
      const updationPayload = {
        title: "Updated title",
        openingTime: "15:00",
        closingTime: "23:00",
      };
      const res = await makePatchEventRequest({
        id: testEvent.id,
        fields: updationPayload,
        files: {},
      });

      expect(res.body.success).toEqual(true);

      const updatedEvent = await helper.get_request_with_authorization({
        endpoint: `events/${testEvent.id}`,
        token: adminToken,
      });

      expect(updatedEvent.body.data.id).toEqual(testCourse.id);
      expect(updatedEvent.body.data.title).toEqual(updationPayload.title);
      expect(updatedEvent.body.data.openingTime).toEqual("15:00:00");
      expect(updatedEvent.body.data.closingTime).toEqual("23:00:00");
      expect(updatedEvent.body.data.address).toEqual(payload.address);
      expect(updatedEvent.body.data.description).toEqual(payload.description);
      expect(updatedEvent.body.data.details).toEqual(payload.details);
      expect(updatedEvent.body.data.gcId).toEqual(testCourse.id);

      expect(() => new URL(updatedEvent.body.data.imageUrl)).not.toThrowError();

      expect(updatedEvent.body.data.corousal.length).toEqual(
        filesData.corousal.length,
      );

      updatedEvent.body.data.corousal.forEach((url) => {
        expect(() => new URL(url)).not.toThrowError();
      });
    });

    it("should update the event corousal images if urls are being sent in corousalUrls", async () => {
      const {
        body: { data: event },
      } = await helper.get_request_with_authorization({
        endpoint: `events/${testEvent.id}`,
        token: adminToken,
      });

      const updationPayload = {
        title: "Updated title",
        openingTime: "15:00",
        closingTime: "23:00",
        corousalUrls: JSON.stringify([event.corousal[0]]),
      };
      const res = await makePatchEventRequest({
        id: testEvent.id,
        fields: updationPayload,
        files: {},
      });

      expect(res.body.success).toEqual(true);

      const updatedEvent = await helper.get_request_with_authorization({
        endpoint: `events/${testEvent.id}`,
        token: adminToken,
      });

      expect(() => new URL(updatedEvent.body.data.imageUrl)).not.toThrowError();

      expect(updatedEvent.body.data.corousal.length).toEqual(1);

      if (config.aws.upload) {
        expect(
          updatedEvent.body.data.corousal[0].split(".com/")[1].split("?")[0],
        ).toEqual(event.corousal[0].split(".com/")[1].split("?")[0]); // it should've deleted rest of the urls
      }

      updatedEvent.body.data.corousal.forEach((url) => {
        expect(() => new URL(url)).not.toThrowError();
      });
    });

    it("should update the thumbnail image of an event, if new image is provided", async () => {
      const {
        body: { data: event },
      } = await helper.get_request_with_authorization({
        endpoint: `events/${testEvent.id}`,
        token: adminToken,
      });

      const updationPayload = {
        title: "Updated title",
        openingTime: "15:00",
        closingTime: "23:00",
      };

      const res = await makePatchEventRequest({
        id: testEvent.id,
        fields: updationPayload,
        files: {
          thumbnail: filesData.thumbnail,
        },
      });

      expect(res.body.success).toEqual(true);

      const updatedEvent = await helper.get_request_with_authorization({
        endpoint: `events/${testEvent.id}`,
        token: adminToken,
      });

      expect(() => new URL(updatedEvent.body.data.imageUrl)).not.toThrowError();

      if (config.aws.upload) {
        expect(
          updatedEvent.body.data.imageUrl.split(".com/")[1].split("?")[0],
        ).not.toEqual(event.imageUrl.split(".com/")[1].split("?")[0]);
      }
    });
  });

  describe("failure", () => {
    it("should throw error if title is not valid string", async () => {
      const _payload = { ...payload };
      _payload["title"] = 45678;
      const res = await makePatchEventRequest({ fields: _payload });

      expect(res.body).toEqual({
        success: false,
        data: "The title must be a string.",
      });
      expect(res.statusCode).toEqual(400);
    });

    it("should throw error if gcId is not valid numb er", async () => {
      const _payload = { ...payload };
      _payload["gcId"] = "invalid id";
      const res = await makePatchEventRequest({ fields: _payload });

      expect(res.body).toEqual({
        success: false,
        data: "The gcId must be an integer.",
      });
      expect(res.statusCode).toEqual(400);
    });

    it("should throw error if openingTime is not valid hour 24 format time", async () => {
      const _payload = { ...payload };
      _payload["openingTime"] = "invalid time";
      const res = await makePatchEventRequest({ fields: _payload });

      expect(res.body).toEqual({
        success: false,
        data: "The openingTime format is invalid.",
      });
      expect(res.statusCode).toEqual(400);
    });

    it("should throw error if closingTime is not valid hour 24 format time", async () => {
      const _payload = { ...payload };
      _payload["closingTime"] = "invalid time";
      const res = await makePatchEventRequest({ fields: _payload });

      expect(res.body).toEqual({
        success: false,
        data: "The closingTime format is invalid.",
      });
      expect(res.statusCode).toEqual(400);
    });

    it("should throw error if address is not valid string", async () => {
      const _payload = { ...payload };
      _payload["address"] = 45678;
      const res = await makePatchEventRequest({ fields: _payload });

      expect(res.body).toEqual({
        success: false,
        data: "The address must be a string.",
      });
      expect(res.statusCode).toEqual(400);
    });

    it("should throw error if details is not valid string", async () => {
      const _payload = { ...payload };
      _payload["details"] = 45678;
      const res = await makePatchEventRequest({ fields: _payload });

      expect(res.body).toEqual({
        success: false,
        data: "The details must be a string.",
      });
      expect(res.statusCode).toEqual(400);
    });

    it("should throw error if description is not valid string", async () => {
      const _payload = { ...payload };
      _payload["description"] = 45678;
      const res = await makePatchEventRequest({ fields: _payload });

      expect(res.body).toEqual({
        success: false,
        data: "The description must be a string.",
      });
      expect(res.statusCode).toEqual(400);
    });

    it("should throw error if thumbnail is not of type one of: ('jpg', 'jpeg', 'png', 'webp')", async () => {
      const res = await makePatchEventRequest({
        id: testEvent.id,
        files: {
          ...filesData,
          thumbnail: {
            name: "mock-logo.svg",
            type: "image/svg",
            size: 5000, // bytes
            path: "/mock/path/to/logo.svg",
          },
        },
      });

      expect(res.body).toEqual({
        success: false,
        data: "Only jpg, jpeg, png, webp files are allowed",
      });
      expect(res.statusCode).toEqual(500);
    });

    it("should throw error if event is not found", async () => {
      const res = await makePatchEventRequest({ fields: payload, id: 56 });

      expect(res.body).toEqual({
        success: false,
        data: "Event Not Found",
      });

      expect(res.statusCode).toEqual(404);
    });

    it("should throw error if course with gcId doesn't exist", async () => {
      payload.gcId = 79853321;

      const res = await makePatchEventRequest({ fields: payload });

      expect(res.body).toEqual({
        success: false,
        data: "Course not found",
      });

      expect(res.statusCode).toEqual(404);
    });
  });
});
