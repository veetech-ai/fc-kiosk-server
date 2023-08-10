const helper = require("../../../../helper");
const models = require("../../../../../models");

const { Tile, Course_Tile } = models;

describe("POST /tiles", () => {
  let adminToken, testCourse;

  const coursePayload = {
    name: "Test course",
    state: "Test State",
    city: "Test city",
    orgId: 1,
  };

  const tilePayload = {
    name: "Test tile",
    isPublished: true,
    isSuperTile: false,
    order: 1,
    layoutNumber: 0,
  };

  const makePostTileRequest = (data = tilePayload) => {
    return helper.post_request_with_authorization({
      endpoint: "tiles",
      token: adminToken,
      params: data,
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

  describe("success", () => {
    it("should create a new tile with defaults", async () => {
      const res = await makePostTileRequest();

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toEqual(true);

      expect(res.body.data.id).toEqual(expect.any(Number));
      expect(res.body.data.gcId).toEqual(testCourse.id);
      expect(res.body.data.isPublished).toEqual(tilePayload.isPublished);
      expect(res.body.data.isSuperTile).toEqual(tilePayload.isSuperTile);
      expect(res.body.data.order).toEqual(expect.any(Number));
      expect(res.body.data.layoutNumber).toEqual(expect.any(Number));

      // Make sure relevant tables have been updated
      const tile = await Tile.findOne({
        where: { id: res.body.data.id },
      });

      expect(tile).not.toBe(null);
      expect(tile.name).toBe(tilePayload.name);

      const courseTile = await Course_Tile.findOne({
        where: { gcId: testCourse.id, tileId: tile.id },
      });

      expect(courseTile).not.toBe(null);
      expect(courseTile.isPublished).toBe(tilePayload.isPublished);
      expect(courseTile.isSuperTile).toBe(tilePayload.isSuperTile);
      expect(courseTile.order).toBe(tilePayload.order);
      expect(courseTile.layoutNumber).toBe(tilePayload.layoutNumber);

      // clean up
      await Tile.destroy({ where: { id: tile.id } });
    });

    it("should increment the order of existing tile if its given", async () => {});
  });
  describe("failure", () => {
    it("should throw error if name is not given", async () => {});

    it("should throw error if name is not valid string", async () => {});

    it("should throw error if gcId is not given", async () => {});

    it("should throw error if gcId is not valid number", async () => {});

    it("should throw error if course with gcId doesn't exist", async () => {});

    it("should throw error if isSuperTile is not boolean", async () => {});

    it("should throw error if isPublished is not boolean", async () => {});

    it("should throw error if order is not valid number", async () => {});

    it("should throw error if layoutNumber is not valid number", async () => {});

    it("should throw error if super tile is true, and duplicate super tile also exist for that course", async () => {});

    it("should throw error if order is not in valid range", async () => {});

    it("should throw error if order is not in valid range", async () => {});
  });
});
