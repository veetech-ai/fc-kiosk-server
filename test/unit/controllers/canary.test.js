const helper = require("../../helper");

let token, superadmin_token;
beforeAll(async () => {
  token = await helper.get_token_for("admin");
  superadmin_token = await helper.get_token_for("superadmin");
});

describe("/canary/all", () => {
  // timezone
  it("Without authorization token", async () => {
    const res = await helper.get_request({
      endpoint: "canary/all",
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

  it("With authorization token but wihout super admin access", async () => {
    const res = await helper.get_request_with_authorization({
      endpoint: "canary/all",
      token: token,
    });

    expect(res.statusCode).toEqual(403);
    expect(res.body.success).toEqual(false);
  });

  it("With authorization token and super admin access", async () => {
    const res = await helper.get_request_with_authorization({
      endpoint: "canary/all",
      token: superadmin_token,
    });
    console.log(res.body);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
  });

  it("With authorization token and pagination", async () => {
    const res = await helper.get_request_with_authorization({
      endpoint: "canary/all?limit=10&page=1",
      token: superadmin_token,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
  });
});
