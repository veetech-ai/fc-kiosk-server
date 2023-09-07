const models = require("../../../../../models");
const helper = require("../../../../helper");
const { uuid } = require("uuidv4");

const awsS3 = require("../../../../../common/external_services/aws-s3");

const serverUpload = require("../../../../../common/server_upload");

const { Course } = models;

let mockFields,
  mockFiles,
  testCourse,
  tilesId,
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

describe("PATCH /tiles", () => {
  let testCourse;
  let adminToken;
  let tilesDataLayout1,
    tilesDataLayout2,
    tilesDataLayout3,
    tilesIdLayout1,
    tilesIdLayout2,
    tilesIdLayout3;

  const filesDataWithoutLayoutImages = {
    bgImage: {
      name: "mock-logo.png",
      type: "image/png",
      size: 5000, // bytes
      path: "/mock/path/to/logo.png",
    },
  };

  const filesDataWithLayoutImages = {
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

  const tilePayload1 = {
    name: "Test tile 1",
    layoutNumber: 1,
    gcId: 1,
    bgImage: "b1766403-c3d3-4ce3-96e6-e213aab70957",
    layoutData:
      '{"courseInfo":{"description":"<p>fsdf</p>"},"layout":{"title":"sfd","subtitle":"sfd"}}',
  };

  const tilePayload2 = {
    name: "Test tile 2",
    layoutNumber: 2,
    gcId: 1,
    bgImage: "b1766403-c3d3-4ce3-96e6-e213aab70957",
    layoutData:
      '{"questionAnswers":[{"question":"dasd","answer":"<p>dsad</p>","isOpen":false},{"question":"dsad","answer":"<p>dsad</p>","isOpen":false}],"layout":{"title":"dasd","subtitle":"dsad"}}',
  };

  const tilePayload3 = {
    name: "Test tile 3",
    layoutNumber: 3,
    gcId: 1,
    bgImage: "b1766403-c3d3-4ce3-96e6-e213aab70957",
    layoutData:
      '{"sections":[{"title":"dsad","subtitle":"dsad","description":"<p>dsad</p>"},{"title":"sdaas","subtitle":"d3123","description":"<p>3213</p>"}],"layout":{"title":"dasdsad","subtitle":"dsad"}}',
  };

  /**
   * Make post request for an event
   * @param {{fields: object, files: object[]}} options request body
   * @returns {Promise<Response>}
   */
  const makePostTileRequest = (options = {}) => {
    const { fields = tilePayload2, files = filesDataWithoutLayoutImages } =
      options;
    mockFields = fields;
    mockFiles = files;

    return helper.post_request_with_authorization({
      endpoint: "tiles",
      token: adminToken,
      params: fields,
      fileupload: true,
    });
  };

  const makePatchTileRequest = (options = {}) => {
    const {
      fields = tilePayload1,
      files = filesDataWithoutLayoutImages,
      tilesId,
    } = options;
    mockFields = fields;
    mockFiles = files;

    return helper.patch_request_with_authorization({
      endpoint: `tiles/${tilesId}`,
      token: adminToken,
      params: fields,
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

    tilePayload1.gcId = tilePayload2.gcId = tilePayload3.gcId = testCourse.id;

    const response = await makePostTileRequest({
      tilePayload1,
      filesDataWithLayoutImages,
    });
    tilesDataLayout1 = response.body.data;
    tilesIdLayout1 = response.body.data.tileId;

    const res = await makePostTileRequest({
      tilePayload2,
      filesDataWithLayoutImages,
    });
    tilesDataLayout2 = res.body.data;
    tilesIdLayout2 = res.body.data.tileId;
    console.log(tilesIdLayout2);

    const result = await makePostTileRequest({
      tilePayload3,
      filesDataWithLayoutImages,
    });
    tilesDataLayout3 = result.body.data;
    tilesIdLayout3 = result.body.data.tileId;
  });

  afterAll(async () => {
    await Course.destroy({ where: { id: testCourse.id } });
  });

  describe("success", () => {
    it("should update the tile with layout 1 having valid input with admin or super admin token", async () => {
      const fields = {
        name: "Test tile Layout 1",
        layoutNumber: 1,
        gcId: 1,
        bgImage: "b1766403-c3d3-4ce3-96e6-e213aab70957",
        layoutData:
          '{"courseInfo":{"description":"<p>fsdf</p>"},"layout":{"title":"sfd","subtitle":"sfd"}}',
      };

      const response = await makePatchTileRequest({
        fields,
        filesDataWithLayoutImages,
        tilesId: tilesIdLayout1,
      });
      expect(response.body.success).toBe(true);
      expect(response.body.data.tileId).toEqual(String(tilesIdLayout1));
      expect(response.body.data.data.name).toBe(fields.name);
      expect(response.body.data.data.gcId).toBe(fields.gcId);
      expect(response.body.data.data.layoutNumber).toBe(fields.layoutNumber);
      expect(response.body.data.data.layoutData).toBe(fields.layoutData);
      expect(response.statusCode).toEqual(200);
    });

    it.only("should update the tile with layout 2 having valid input with admin or super admin token", async () => {
      const fields = {
        name: "Test tile Layout 2",
        layoutNumber: 2,
        gcId: 1,
        bgImage: "b1766403-c3d3-4ce3-96e6-e213aab70957",
        layoutData:
          '{"questionAnswers":[{"question":"dasd","answer":"<p>dsad</p>","isOpen":false},{"question":"dsad","answer":"<p>dsad</p>","isOpen":false}],"layout":{"title":"dasd","subtitle":"dsad"}}',
      };
      console.log(tilesIdLayout2);

      const response = await makePatchTileRequest({
        fields,
        filesDataWithoutLayoutImages,
        tilesId: tilesIdLayout2,
      });
      expect(response.body.success).toBe(true);
      expect(response.body.data.tileId).toEqual(String(tilesIdLayout2));
      expect(response.body.data.data.name).toBe(fields.name);
      expect(response.body.data.data.gcId).toBe(fields.gcId);
      expect(response.body.data.data.layoutNumber).toBe(fields.layoutNumber);
      expect(response.body.data.data.layoutData).toBe(fields.layoutData);
      expect(response.statusCode).toEqual(200);
    });

    it("should update the tile with layout 3 having valid input with admin or super admin token", async () => {
      const fields = {
        name: "Test tile Layout 3",
        layoutNumber: 3,
        gcId: 1,
        bgImage: "b1766403-c3d3-4ce3-96e6-e213aab70957",
        layoutData:
          '{"sections":[{"title":"dsad","subtitle":"dsad","description":"<p>dsad</p>"},{"title":"sdaas","subtitle":"d3123","description":"<p>3213</p>"}],"layout":{"title":"dasdsad","subtitle":"dsad"}}',
      };
      console.log(tilesIdLayout3);
      const response = await makePatchTileRequest({
        fields,
        filesDataWithLayoutImages,
        tilesId: tilesIdLayout3,
      });

      expect(response.body.success).toBe(true);
      expect(response.body.data.tileId).toEqual(String(tilesIdLayout3));
      expect(response.body.data.data.name).toBe(fields.name);
      expect(response.body.data.data.gcId).toBe(fields.gcId);
      expect(response.body.data.data.layoutNumber).toBe(fields.layoutNumber);
      expect(response.body.data.data.layoutData).toBe(fields.layoutData);
      expect(response.statusCode).toEqual(200);
    });
  });
  // describe("failure", () => {
  //   it("should throw error if name is not given", async () => {
  //     const fields = {
  //       layoutNumber: 2,
  //       gcId: 1,
  //       bgImage: "b1766403-c3d3-4ce3-96e6-e213aab70957",
  //       layoutData:
  //         '{"questionAnswers":[{"question":"dasd","answer":"<p>dsad</p>","isOpen":false},{"question":"dsad","answer":"<p>dsad</p>","isOpen":false}],"layout":{"title":"dasd","subtitle":"dsad"}}',
  //     };

  //     const response = await makePostTileRequest({
  //       fields,
  //       filesDataWithoutLayoutImages,
  //     });

  //     expect(response.body.data).toBe("The name field is required.");
  //     expect(response.body.success).toBe(false);
  //     expect(response.statusCode).toEqual(400);
  //   });

  //   it("should throw error if name is not a valid string", async () => {
  //     const fields = {
  //       name: 2,
  //       layoutNumber: 2,
  //       gcId: 1,
  //       bgImage: "b1766403-c3d3-4ce3-96e6-e213aab70957",
  //       layoutData:
  //         '{"questionAnswers":[{"question":"dasd","answer":"<p>dsad</p>","isOpen":false},{"question":"dsad","answer":"<p>dsad</p>","isOpen":false}],"layout":{"title":"dasd","subtitle":"dsad"}}',
  //     };

  //     const response = await makePostTileRequest({
  //       fields,
  //       filesDataWithoutLayoutImages,
  //     });

  //     expect(response.body.data).toBe("The name must be a string.");
  //     expect(response.body.success).toBe(false);
  //     expect(response.statusCode).toEqual(400);
  //   });

  //   it("should throw error if gcId is not given", async () => {
  //     const fields = {
  //       name: "Demo tile 2",
  //       layoutNumber: 2,
  //       bgImage: "b1766403-c3d3-4ce3-96e6-e213aab70957",
  //       layoutData:
  //         '{"questionAnswers":[{"question":"dasd","answer":"<p>dsad</p>","isOpen":false},{"question":"dsad","answer":"<p>dsad</p>","isOpen":false}],"layout":{"title":"dasd","subtitle":"dsad"}}',
  //     };

  //     const response = await makePostTileRequest({
  //       fields,
  //       filesDataWithoutLayoutImages,
  //     });

  //     expect(response.body.data).toBe("The gcId field is required.");
  //     expect(response.body.success).toBe(false);
  //     expect(response.statusCode).toEqual(400);
  //   });

  //   it("should throw error if course with gcId doesn't exist", async () => {
  //     const fields = {
  //       name: "Demo tile 2",
  //       layoutNumber: 2,
  //       gcId: 5,
  //       bgImage: "b1766403-c3d3-4ce3-96e6-e213aab70957",
  //       layoutData:
  //         '{"questionAnswers":[{"question":"dasd","answer":"<p>dsad</p>","isOpen":false},{"question":"dsad","answer":"<p>dsad</p>","isOpen":false}],"layout":{"title":"dasd","subtitle":"dsad"}}',
  //     };

  //     const response = await makePostTileRequest({
  //       fields,
  //       filesDataWithoutLayoutImages,
  //     });

  //     expect(response.body.data).toBe("Course not found");
  //     expect(response.body.success).toBe(false);
  //     expect(response.statusCode).toEqual(404);
  //   });

  //   it("should throw error if layoutData is not given", async () => {
  //     const fields = {
  //       name: "Demo tile 2",
  //       layoutNumber: 2,
  //       gcId: 5,
  //       bgImage: "b1766403-c3d3-4ce3-96e6-e213aab70957",
  //     };

  //     const response = await makePostTileRequest({
  //       fields,
  //       filesDataWithoutLayoutImages,
  //     });

  //     expect(response.body.data).toBe("The layoutData field is required.");
  //     expect(response.body.success).toBe(false);
  //     expect(response.statusCode).toEqual(400);
  //   });

  //   it("should throw error if layoutNumber is not given", async () => {
  //     const fields = {
  //       name: "Demo tile 2",
  //       gcId: 1,

  //       bgImage: "b1766403-c3d3-4ce3-96e6-e213aab70957",
  //       layoutData:
  //         '{"questionAnswers":[{"question":"dasd","answer":"<p>dsad</p>","isOpen":false},{"question":"dsad","answer":"<p>dsad</p>","isOpen":false}],"layout":{"title":"dasd","subtitle":"dsad"}}',
  //     };

  //     const response = await makePostTileRequest({
  //       fields,
  //       filesDataWithoutLayoutImages,
  //     });

  //     expect(response.body.data).toBe("The layoutNumber field is required.");
  //     expect(response.body.success).toBe(false);
  //     expect(response.statusCode).toEqual(400);
  //   });

  //   it("should throw error if layoutNumber is greater than 3 or less than 1", async () => {
  //     const fields = {
  //       name: "Demo tile 2",
  //       gcId: 1,
  //       layoutNumber: 4,

  //       bgImage: "b1766403-c3d3-4ce3-96e6-e213aab70957",
  //       layoutData:
  //         '{"questionAnswers":[{"question":"dasd","answer":"<p>dsad</p>","isOpen":false},{"question":"dsad","answer":"<p>dsad</p>","isOpen":false}],"layout":{"title":"dasd","subtitle":"dsad"}}',
  //     };

  //     const response = await makePostTileRequest({
  //       fields,
  //       filesDataWithoutLayoutImages,
  //     });

  //     expect(response.body.data).toBe(
  //       "The layoutNumber must one of 1, 2 or 3.",
  //     );
  //     expect(response.body.success).toBe(false);
  //     expect(response.statusCode).toEqual(400);
  //   });

  //   it("should throw error if layoutNumber is equal to 0", async () => {
  //     const fields = {
  //       name: "Demo tile 2",
  //       gcId: 1,
  //       layoutNumber: 0,

  //       bgImage: "b1766403-c3d3-4ce3-96e6-e213aab70957",
  //       layoutData:
  //         '{"questionAnswers":[{"question":"dasd","answer":"<p>dsad</p>","isOpen":false},{"question":"dsad","answer":"<p>dsad</p>","isOpen":false}],"layout":{"title":"dasd","subtitle":"dsad"}}',
  //     };

  //     const response = await makePostTileRequest({
  //       fields,
  //       filesDataWithoutLayoutImages,
  //     });

  //     expect(response.body.data).toBe(
  //       "The tile with custom layout can not have layoutNumber '0', use 1, 2 or 3 instead",
  //     );
  //     expect(response.body.success).toBe(false);
  //     expect(response.statusCode).toEqual(400);
  //   });
  //   it("should throw error if layoutData is not a JSON", async () => {
  //     const fields = {
  //       name: "Demo tile 2",
  //       gcId: 1,
  //       layoutNumber: 2,
  //       bgImage: "b1766403-c3d3-4ce3-96e6-e213aab70957",
  //       layoutData: "question1",
  //     };

  //     const response = await makePostTileRequest({
  //       fields,
  //       filesDataWithoutLayoutImages,
  //     });

  //     expect(response.body.data).toMatch(
  //       /Unexpected token .+ in JSON at position \d+/,
  //     );

  //     expect(response.body.success).toBe(false);
  //     expect(response.statusCode).toEqual(400);
  //   });

  //   it("should throw error if bgImage is not given", async () => {
  //     const fields = {
  //       name: "Demo tile 2",
  //       gcId: 1,
  //       layoutNumber: 2,
  //       layoutData:
  //         '{"questionAnswers":[{"question":"dasd","answer":"<p>dsad</p>","isOpen":false},{"question":"dsad","answer":"<p>dsad</p>","isOpen":false}],"layout":{"title":"dasd","subtitle":"dsad"}}',
  //     };

  //     const response = await makePostTileRequest({
  //       fields,
  //       filesDataWithoutLayoutImages,
  //     });

  //     expect(response.body.data).toBe("The bgImage field is required.");
  //     expect(response.body.success).toBe(false);
  //     expect(response.statusCode).toEqual(400);
  //   });

  //   it("should throw error if isSuperTile is not boolean", async () => {
  //     const fields = {
  //       name: "Demo tile 2",
  //       layoutNumber: 2,
  //       gcId: 1,
  //       bgImage: "b1766403-c3d3-4ce3-96e6-e213aab70957",
  //       isSuperTile: "2",
  //       layoutData:
  //         '{"questionAnswers":[{"question":"dasd","answer":"<p>dsad</p>","isOpen":false},{"question":"dsad","answer":"<p>dsad</p>","isOpen":false}],"layout":{"title":"dasd","subtitle":"dsad"}}',
  //     };

  //     const response = await makePostTileRequest({
  //       fields,
  //       filesDataWithoutLayoutImages,
  //     });

  //     expect(response.body.data).toBe("The isSuperTile attribute has errors.");
  //     expect(response.body.success).toBe(false);
  //     expect(response.statusCode).toEqual(400);
  //   });

  //   it("should throw error if isPublished is not boolean", async () => {
  //     const fields = {
  //       name: "Demo tile 2",
  //       layoutNumber: 2,
  //       gcId: 1,
  //       bgImage: "b1766403-c3d3-4ce3-96e6-e213aab70957",
  //       isPublished: "2",
  //       layoutData:
  //         '{"questionAnswers":[{"question":"dasd","answer":"<p>dsad</p>","isOpen":false},{"question":"dsad","answer":"<p>dsad</p>","isOpen":false}],"layout":{"title":"dasd","subtitle":"dsad"}}',
  //     };

  //     const response = await makePostTileRequest({
  //       fields,
  //       filesDataWithoutLayoutImages,
  //     });

  //     expect(response.body.data).toBe("The isPublished attribute has errors.");
  //     expect(response.body.success).toBe(false);
  //     expect(response.statusCode).toEqual(400);
  //   });

  //   it("should throw error if super tile is true, and duplicate super tile also exist for that course", async () => {
  //     let fields = {
  //       name: "Demo testing tile 1",
  //       layoutNumber: 2,
  //       gcId: 1,
  //       bgImage: "b1766403-c3d3-4ce3-96e6-e213aab70957",
  //       isSuperTile: true,
  //       layoutData:
  //         '{"questionAnswers":[{"question":"dasd","answer":"<p>dsad</p>","isOpen":false},{"question":"dsad","answer":"<p>dsad</p>","isOpen":false}],"layout":{"title":"dasd","subtitle":"dsad"}}',
  //     };
  //     await makePostTileRequest({
  //       fields,
  //       filesDataWithoutLayoutImages,
  //     });
  //     fields = {
  //       name: "Demo testing tile 2",
  //       layoutNumber: 2,
  //       gcId: 1,
  //       bgImage: "b1766403-c3d3-4ce3-96e6-e213aab70957",
  //       isSuperTile: true,
  //       layoutData:
  //         '{"questionAnswers":[{"question":"dasd","answer":"<p>dsad</p>","isOpen":false},{"question":"dsad","answer":"<p>dsad</p>","isOpen":false}],"layout":{"title":"dasd","subtitle":"dsad"}}',
  //     };

  //     const response = await makePostTileRequest({
  //       fields,
  //       filesDataWithoutLayoutImages,
  //     });

  //     expect(response.body.data).toMatch(
  //       /A super tile already exists for this course. With id \d+/,
  //     );
  //     expect(response.body.success).toBe(false);
  //     expect(response.statusCode).toEqual(400);
  //   });

  //   it("should throw error if a tile with same name already exists for the course", async () => {
  //     let fields = {
  //       name: "Demo testing tile",
  //       layoutNumber: 2,
  //       gcId: 1,
  //       bgImage: "b1766403-c3d3-4ce3-96e6-e213aab70957",
  //       layoutData:
  //         '{"questionAnswers":[{"question":"dasd","answer":"<p>dsad</p>","isOpen":false},{"question":"dsad","answer":"<p>dsad</p>","isOpen":false}],"layout":{"title":"dasd","subtitle":"dsad"}}',
  //     };
  //     await makePostTileRequest({
  //       fields,
  //       filesDataWithoutLayoutImages,
  //     });
  //     fields = {
  //       name: "Demo testing tile",
  //       layoutNumber: 2,
  //       gcId: 1,
  //       bgImage: "b1766403-c3d3-4ce3-96e6-e213aab70957",
  //       layoutData:
  //         '{"questionAnswers":[{"question":"dasd","answer":"<p>dsad</p>","isOpen":false},{"question":"dsad","answer":"<p>dsad</p>","isOpen":false}],"layout":{"title":"dasd","subtitle":"dsad"}}',
  //     };

  //     const response = await makePostTileRequest({
  //       fields,
  //       filesDataWithoutLayoutImages,
  //     });

  //     expect(response.body.data).toBe(
  //       "A tile with same name already exist for this course",
  //     );
  //     expect(response.body.success).toBe(false);
  //     expect(response.statusCode).toEqual(400);
  //   });
  //   it("should throw error if bgImage extension is not allowed", async () => {
  //     const fields = {
  //       name: "Demo New tile",
  //       gcId: 1,
  //       layoutNumber: 1,
  //       bgImage: "b1766403-c3d3-4ce3-96e6-e213aab70957",
  //       layoutData:
  //         '{"courseInfo":{"description":"<p>fsdf</p>"},"layout":{"title":"sfd","subtitle":"sfd"}}',
  //     };

  //     const files = {
  //       bgImage: {
  //         name: "mock-logo.gif",
  //         type: "image/gif",
  //         size: 5000, // bytes
  //         path: "/mock/path/to/logo.gif",
  //       },
  //       layoutImages: {
  //         name: "mock-logo.png",
  //         type: "image/png",
  //         size: 5000, // bytes
  //         path: "/mock/path/to/logo.png",
  //       },
  //     };

  //     const response = await makePostTileRequest({
  //       fields,
  //       files,
  //     });

  //     expect(response.body.data).toBe(
  //       "Only jpg, jpeg, png, webp files are allowed",
  //     );
  //     expect(response.body.success).toBe(false);
  //     expect(response.statusCode).toEqual(500);
  //   });
  //   it("should throw error if LayoutImage extension is not allowed", async () => {
  //     const fields = {
  //       name: "Demo New tile",
  //       gcId: 1,
  //       layoutNumber: 1,
  //       bgImage: "b1766403-c3d3-4ce3-96e6-e213aab70957",
  //       layoutData:
  //         '{"courseInfo":{"description":"<p>fsdf</p>"},"layout":{"title":"sfd","subtitle":"sfd"}}',
  //     };

  //     const files = {
  //       bgImage: {
  //         name: "mock-logo.png",
  //         type: "image/png",
  //         size: 5000, // bytes
  //         path: "/mock/path/to/logo.png",
  //       },
  //       layoutImages: {
  //         name: "mock-logo.gif",
  //         type: "image/gif",
  //         size: 5000, // bytes
  //         path: "/mock/path/to/logo.gif",
  //       },
  //     };

  //     const response = await makePostTileRequest({
  //       fields,
  //       files,
  //     });

  //     expect(response.body.data).toBe(
  //       "Only jpg, jpeg, png, webp files are allowed",
  //     );
  //     expect(response.body.success).toBe(false);
  //     expect(response.statusCode).toEqual(500);
  //   });
  // });
});
