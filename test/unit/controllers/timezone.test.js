const helper = require("../../helper");

let token;
beforeAll(async () => {
  token = await helper.get_token_for("testCustomer");
});

describe("timezone", () => {
  describe("/all", () => {
    // timezone
    it("should not response Without authorization token", async () => {
      const res = await helper.get_request({
        endpoint: "timezone/all",
      });

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toEqual(false);
    });

    it("should response With authorization token and pagination", async () => {
      const res = await helper.get_request_with_authorization({
        endpoint: "timezone/all?limit=10&page=1",
        token: token,
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toEqual(true);
    });

    it("should response With authorization token", async () => {
      const res = await helper.get_request_with_authorization({
        endpoint: "timezone/all",
        token: token,
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toEqual(true);
    });
  });

  describe("/time", () => {
    describe("success", () => {
      it("should get time", async () => {
        const res = await helper.get_request_with_authorization({
          endpoint: "timezone/time",
          token: token,
        });
        expect(res.statusCode).toEqual(200);
      });
    });
  });
});
