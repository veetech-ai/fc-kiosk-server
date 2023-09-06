const models = require("../../../../../models");
const helper = require("../../../../helper");
const { uuid } = require("uuidv4");

const awsS3 = require("../../../../../common/external_services/aws-s3");

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
serverUpload.uploadv1 = jest.fn(() => Promise.resolve(uuid()));

const { Tile, Course_Tile } = models;

describe("POST /tiles", () => {
  let testCourse;
  let adminToken;
  let courseId;
  let invalidCourseId = -1;
  let orgId;
  let customerToken;
  let testOperatorToken;
  let differentOrganizationCustomerToken;

  const filesData = {
    bgImage: {
      name: "mock-logo.png",
      type: "image/png",
      size: 5000, // bytes
      path: "/mock/path/to/logo.png",
    },
    layoutImages: [
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

  const tilePayload = {
    name: "Test tile",
    layoutNumber: 2,
    gcId: 1,
    bgImage: "b1766403-c3d3-4ce3-96e6-e213aab70957",
    layoutData:
      '{"questionAnswers":[{"question":"dasd","answer":"<p>dsad</p>","isOpen":false},{"question":"dsad","answer":"<p>dsad</p>","isOpen":false}],"layout":{"title":"dasd","subtitle":"dsad"}}',
  };

  /**
   * Make post request for an event
   * @param {{fields: object, files: object[]}} options request body
   * @returns {Promise<Response>}
   */
  const makePostTileRequest = (options = {}) => {
    const { fields = tilePayload, files = filesData } = options;
    mockFields = fields;
    mockFiles = files;

    return helper.post_request_with_authorization({
      endpoint: "tiles",
      token: adminToken,
      params: tilePayload,
      fileupload: true,
    });
  };

  beforeAll(async () => {
    adminToken = await helper.get_token_for("admin");

    testCourse = await helper.post_request_with_authorization({
      endpoint: "kiosk-courses",
      token: adminToken,
      params: coursePayload,
    });

    testCourse = testCourse.body.data;

    tilePayload.gcId = testCourse.id;
  });
  afterAll(async () => {
    await Course.destroy({ where: { id: tilePayload.gcId } });
  });

  describe("success", () => {
    // it("should create a new tile with defaults", async () => {
    //   const res = await makePostTileRequest();
    //   expect(res.statusCode).toEqual(201);
    //   expect(res.body.success).toEqual(true);
    //   expect(res.body.data.id).toEqual(expect.any(Number));
    //   expect(res.body.data.gcId).toEqual(testCourse.id);
    //   expect(res.body.data.isPublished).toEqual(tilePayload.isPublished);
    //   expect(res.body.data.isSuperTile).toEqual(tilePayload.isSuperTile);
    //   expect(res.body.data.orderNumber).toEqual(13);
    //   expect(res.body.data.layoutNumber).toEqual(expect.any(Number));
    //   // Make sure relevant tables have been updated
    //   const tile = await Tile.findOne({
    //     where: { id: res.body.data.id },
    //   });
    //   expect(tile).not.toBe(null);
    //   expect(tile.name).toBe(tilePayload.name);
    //   const courseTile = await Course_Tile.findOne({
    //     where: { gcId: testCourse.id, tileId: tile.id },
    //   });
    //   expect(courseTile).not.toBe(null);
    //   expect(courseTile.isPublished).toBe(tilePayload.isPublished);
    //   expect(courseTile.isSuperTile).toBe(tilePayload.isSuperTile);
    //   expect(courseTile.orderNumber).toBe(13);
    //   expect(courseTile.layoutNumber).toBe(tilePayload.layoutNumber);
    //   // clean up
    //   await Tile.destroy({ where: { id: tile.id } });
    // });
    it("should create a new tile with layout 2 having valid input with admin or super admin token", async () => {
      console.log("Creating a new");
      const fields = {
        name: "Test tile",
        layoutNumber: 2,
        gcId: 1,
        bgImage: "b1766403-c3d3-4ce3-96e6-e213aab70957",
        layoutData:
          '{"questionAnswers":[{"question":"dasd","answer":"<p>dsad</p>","isOpen":false},{"question":"dsad","answer":"<p>dsad</p>","isOpen":false}],"layout":{"title":"dasd","subtitle":"dsad"}}',
      };

      const files = {
        bgImage: {
          name: "mock-logo.png",
          type: "image/png",
          size: 5000, // bytes
          path: "/mock/path/to/logo.png",
        },
      };
      console.log("Creating a new 2");

      const response = await makePostTileRequest(fields, files);
      console.log("Creating a new 3");

      expect(response.body.success).toBe(true);
      console.log("Creating a new 4");
    });

    it("should increment the order of existing tile if its given", async () => {});
  });
  // describe("failure", () => {
  //   it("should throw error if name is not given", async () => {});

  //   it("should throw error if name is not valid string", async () => {});

  //   it("should throw error if gcId is not given", async () => {});

  //   it("should throw error if gcId is not valid number", async () => {});

  //   it("should throw error if course with gcId doesn't exist", async () => {});

  //   it("should throw error if isSuperTile is not boolean", async () => {});

  //   it("should throw error if isPublished is not boolean", async () => {});

  //   it("should throw error if order is not valid number", async () => {});

  //   it("should throw error if layoutNumber is not valid number", async () => {});

  //   it("should throw error if super tile is true, and duplicate super tile also exist for that course", async () => {});

  //   it("should throw error if order is not in valid range", async () => {});

  //   it("should throw error if order is not in valid range", async () => {});
  // });
});
