const helper = require("../../../../helper");

describe("GHIN API", () => {
  describe("PATCH /ghin/{gcId}", () => {
    let adminToken = null;
    const payload = { url: "https:www.youtube.com" };

    const makeRequest = (params = payload, id = 1) => {
      return helper.post_request_with_authorization({
        endpoint: `ghin/${id}`,
        token: adminToken,
        params,
      });
    };

    beforeAll(async () => {
      adminToken = await helper.get_token_for("admin");
    });

    describe("success", () => {
      it("should update the ghin url for the course", async () => {
        const res = await makeRequest();

        const courseRes = await helper.get_request_with_authorization({
          endpoint: `kiosk-course/1`,
          token: adminToken,
        });

        expect(res.body).toEqual({
          sucess: true,
          data: `URL: ${payload.url} is set for course: ${
            courseRes.body.name
          } having id: ${1}`,
        });

        expect(res.statusCode).toEqual(200);
      });
    });

    describe("failure", () => {
      it("should throw error if url is not valid", async () => {
        const res = await makeRequest({ url: "invalid url" });

        expect(res.body).toEqual({
          sucess: false,
          data: "Given url is invalid",
        });

        expect(res.statusCode).toEqual(404);
      });

      it("should throw error if course is not found", async () => {
        const gcId = 98989898989;
        const res = await makeRequest({ url: "invalid url" }, gcId);

        expect(res.body).toEqual({
          sucess: false,
          data: `Course not found with id: ${gcId}`,
        });

        expect(res.statusCode).toEqual(400);
      });

      it("should throw error if id is not valid", async () => {
        const gcId = "invalid";
        const res = await makeRequest({ url: "invalid url" }, gcId);

        expect(res.body).toEqual({
          sucess: false,
          data: `gcId is not valid integer`,
        });

        expect(res.statusCode).toEqual(400);
      });

      it("should throw error if url is not string", async () => {
        const gcId = "invalid";
        const res = await makeRequest({ url: 46383 }, gcId);

        expect(res.body).toEqual({
          sucess: false,
          data: `url is not valid string`,
        });

        expect(res.statusCode).toEqual(400);
      });
    });
  });
});
