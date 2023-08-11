const helper = require("../../../helper");

const models = require("../../../../models");

const { Course } = models;

describe("GHIN API", () => {
  describe("PATCH /ghin/{gcId}", () => {
    let adminToken = null;
    let course = null;

    const payload = { url: "https://www.youtube.com" };

    const makeUpdateRequest = (params = payload, id = 1) => {
      return helper.patch_request_with_authorization({
        endpoint: `ghin/${id}`,
        token: adminToken,
        params,
      });
    };

    beforeAll(async () => {
      adminToken = await helper.get_token_for("admin");
    });

    beforeEach(async () => {
      course = await Course.create({
        name: "Test Course",
        phone: "+1 533 533 69",
        country: "United States",
        orgId: 1,
        ghin_url: "https://www.ghin.com/login",
      });
    });

    describe("success", () => {
      it("should update the ghin url for the course", async () => {
        const courseId = course.id;

        const res = await makeUpdateRequest();

        // Make sure its updated in db
        const updatedCourse = await Course.findOne({
          where: { id: courseId },
          attributes: ["id", "name", "ghin_url"],
        });

        expect(updatedCourse.ghin_url).toEqual(payload.url);

        // Validate API response
        expect(res.body).toEqual({
          success: true,
          data: `URL: ${payload.url} is set for course: ${updatedCourse.name} having id: ${courseId}`,
        });

        expect(res.statusCode).toEqual(200);
      });
    });

    describe("failure", () => {
      it("should throw error if url is not valid", async () => {
        const res = await makeUpdateRequest({ url: "invalid url" }, course.id);

        expect(res.body).toEqual({
          success: false,
          data: "Given url is invalid",
        });

        expect(res.statusCode).toEqual(400);
      });

      it("should throw error if course is not found", async () => {
        const gcId = 98989898989;
        const res = await makeUpdateRequest(
          { url: "https://www.site.com" },
          gcId,
        );

        expect(res.body).toEqual({
          success: false,
          data: `Course not found with id: ${gcId}`,
        });

        expect(res.statusCode).toEqual(404);
      });

      it("should throw error if id is not valid", async () => {
        const gcId = "invalid";
        const res = await makeUpdateRequest(
          { url: "https://www.site.com" },
          gcId,
        );

        expect(res.body).toEqual({
          success: false,
          data: `The gcId must be an integer.`,
        });

        expect(res.statusCode).toEqual(400);
      });

      it("should throw error if url is not provided", async () => {
        const gcId = "invalid";
        const res = await makeUpdateRequest({}, gcId);

        expect(res.body).toEqual({
          success: false,
          data: `The url field is required.`,
        });

        expect(res.statusCode).toEqual(400);
      });

      it("should throw error if url is not string", async () => {
        const gcId = "invalid";
        const res = await makeUpdateRequest({ url: 46383 }, gcId);

        expect(res.body).toEqual({
          success: false,
          data: `The url must be a string.`,
        });

        expect(res.statusCode).toEqual(400);
      });
    });
  });
});
