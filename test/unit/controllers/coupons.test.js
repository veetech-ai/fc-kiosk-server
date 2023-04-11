const helper = require("../../helper");
const app_helper = require("../../../common/helper");

let tokens, new_coupon;
const code = app_helper.generate_random_string({ length: 5 });
beforeAll(async () => {
  tokens = await helper.get_all_roles_tokens();
});

describe("/coupon/all/available", () => {
  // coupons
  it("Get all available", async () => {
    const res = await helper.get_request({
      endpoint: "coupon/all/available",
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
  });

  it("Get all available with pagination", async () => {
    const res = await helper.get_request({
      endpoint: "coupon/all/available?limit=10&page=1",
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
  });
});

describe("/coupon/all", () => {
  // coupons
  it("Get all without token", async () => {
    const res = await helper.get_request({
      endpoint: "coupon/all",
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

  it("Get all with token of non admin user", async () => {
    const res = await helper.get_request_with_authorization({
      endpoint: "coupon/all",
      token: tokens.testOperator,
    });

    expect(res.statusCode).toEqual(403);
    expect(res.body.success).toEqual(false);
  });

  it("Get all", async () => {
    const res = await helper.get_request_with_authorization({
      endpoint: "coupon/all",
      token: tokens.superadmin,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
  });

  it("Get all with pagination", async () => {
    const res = await helper.get_request_with_authorization({
      endpoint: "coupon/all?limit=10&page=1",
      token: tokens.superadmin,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
  });
});

describe("/coupon/create", () => {
  // create coupons
  it("Without access token", async () => {
    const res = await helper.post_request({
      endpoint: "coupon/create",
      params: {},
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

  it("With invalid access token", async () => {
    const res = await helper.post_request_with_authorization({
      endpoint: "coupon/create",
      params: {},
      token: "invalid token",
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

  it("With non admin or super admin user access token", async () => {
    const res = await helper.post_request_with_authorization({
      endpoint: "coupon/create",
      params: {},
      token: tokens.testOperator,
    });

    expect(res.statusCode).toEqual(403);
    expect(res.body.success).toEqual(false);
  });

  it("Without required params", async () => {
    const res = await helper.post_request_with_authorization({
      endpoint: "coupon/create",
      params: {},
      token: tokens.superadmin,
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toEqual(false);
  });

  it("Without some of required params", async () => {
    const res = await helper.post_request_with_authorization({
      endpoint: "coupon/create",
      params: {
        title: "test coupon",
      },
      token: tokens.superadmin,
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toEqual(false);
  });

  it("With required params", async () => {
    const res = await helper.post_request_with_authorization({
      endpoint: "coupon/create",
      params: {
        title: "test coupon",
        expiry: "2050-01-01",
        code: code,
        discount_type: 0,
        discount: 100,
        coupon_for: 0,
        max_use_limit: 5,
      },
      token: tokens.superadmin,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.data).toHaveProperty("id");

    new_coupon = res.body.data;
  });

  it("Already exists coupon", async () => {
    const res = await helper.post_request_with_authorization({
      endpoint: "coupon/create",
      params: {
        title: "test coupon",
        expiry: "2050-01-01",
        code: code,
        discount_type: 0,
        discount: 100,
        coupon_for: 0,
        max_use_limit: 5,
      },
      token: tokens.superadmin,
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toEqual(false);
    expect(res.body.data).toBe("Coupon code already exists");
  });
});

describe("/coupon/get/{id}", () => {
  // get single coupon
  it("Get by invalid ID", async () => {
    const res = await helper.get_request({
      endpoint: "coupon/get/invalid_id",
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.data).toBeNull();
  });

  it("Get by valid ID", async () => {
    const res = await helper.get_request({
      endpoint: `coupon/get/${new_coupon.id}`,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.data).toHaveProperty("id", new_coupon.id);
    expect(res.body.data).toHaveProperty("code", new_coupon.code);
  });
});

describe("/coupon/update/{couponId}", () => {
  // update coupon
  it("Without access token", async () => {
    const res = await helper.put_request({
      endpoint: `coupon/update/${new_coupon.id}`,
      params: {},
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

  it("With invalid access token", async () => {
    const res = await helper.put_request_with_authorization({
      endpoint: `coupon/update/${new_coupon.id}`,
      params: {},
      token: "invalid token",
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

  it("With non admin or super admin user access token", async () => {
    const res = await helper.put_request_with_authorization({
      endpoint: `coupon/update/${new_coupon.id}`,
      params: {},
      token: tokens.testOperator,
    });

    expect(res.statusCode).toEqual(403);
    expect(res.body.success).toEqual(false);
  });

  it("Without required params", async () => {
    const res = await helper.put_request_with_authorization({
      endpoint: `coupon/update/${new_coupon.id}`,
      params: {},
      token: tokens.superadmin,
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toEqual(false);
  });

  it("Without some of required params", async () => {
    const res = await helper.put_request_with_authorization({
      endpoint: `coupon/update/${new_coupon.id}`,
      params: {
        title: "test coupon",
      },
      token: tokens.superadmin,
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toEqual(false);
  });

  it("With required params", async () => {
    const res = await helper.put_request_with_authorization({
      endpoint: `coupon/update/${new_coupon.id}`,
      params: {
        title: "test coupon 2",
        expiry: "2055-01-01",
        code: new_coupon.code,
        discount_type: 0,
        discount: 100,
        coupon_for: 0,
        max_use_limit: 5,
      },
      token: tokens.superadmin,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
  });
});

describe("/coupon/status/{couponId}", () => {
  // update coupon status
  it("Without access token", async () => {
    const res = await helper.put_request({
      endpoint: `coupon/status/${new_coupon.id}`,
      params: {},
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

  it("With invalid access token", async () => {
    const res = await helper.put_request_with_authorization({
      endpoint: `coupon/status/${new_coupon.id}`,
      params: {},
      token: "invalid token",
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

  it("With non admin or super admin user access token", async () => {
    const res = await helper.put_request_with_authorization({
      endpoint: `coupon/status/${new_coupon.id}`,
      params: {},
      token: tokens.testOperator,
    });

    expect(res.statusCode).toEqual(403);
    expect(res.body.success).toEqual(false);
  });

  it("Without required params", async () => {
    const res = await helper.put_request_with_authorization({
      endpoint: `coupon/status/${new_coupon.id}`,
      params: {},
      token: tokens.superadmin,
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toEqual(false);
  });

  it("With required params", async () => {
    const new_status = 1;
    const res = await helper.put_request_with_authorization({
      endpoint: `coupon/status/${new_coupon.id}`,
      params: {
        status: new_status,
      },
      token: tokens.superadmin,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);

    new_coupon.status = new_status;
  });
});

describe("/coupon/validate", () => {
  // Validate Coupon
  it("Without access token", async () => {
    const res = await helper.post_request({
      endpoint: "coupon/validate",
      params: {},
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

  it("With invalid access token", async () => {
    const res = await helper.post_request_with_authorization({
      endpoint: "coupon/validate",
      params: {},
      token: "invalid token",
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

  it("Without required params", async () => {
    const res = await helper.post_request_with_authorization({
      endpoint: "coupon/validate",
      params: {},
      token: tokens.testOperator,
    });

    expect(res.statusCode).toEqual(500);
    expect(res.body.success).toEqual(false);
  });

  it("With invalid coupon code", async () => {
    const res = await helper.post_request_with_authorization({
      endpoint: "coupon/validate",
      params: {
        code: "invalid code",
      },
      token: tokens.testOperator,
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toEqual(false);
  });

  it("With valid code", async () => {
    const res = await helper.post_request_with_authorization({
      endpoint: "coupon/validate",
      params: {
        code: code,
      },
      token: tokens.testOperator,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
  });
});

describe("/coupon/apply", () => {
  // Apply Coupon
  it("Without access token", async () => {
    const res = await helper.post_request({
      endpoint: "coupon/apply",
      params: {},
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

  it("With invalid access token", async () => {
    const res = await helper.post_request_with_authorization({
      endpoint: "coupon/apply",
      params: {},
      token: "invalid token",
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

  it("Without required params", async () => {
    const res = await helper.post_request_with_authorization({
      endpoint: "coupon/apply",
      params: {},
      token: tokens.testOperator,
    });

    expect(res.statusCode).toEqual(500);
    expect(res.body.success).toEqual(false);
  });

  it("With invalid coupon code", async () => {
    const res = await helper.post_request_with_authorization({
      endpoint: "coupon/apply",
      params: {
        code: "invalid code",
      },
      token: tokens.testOperator,
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toEqual(false);
  });

  it("With valid code", async () => {
    const res = await helper.post_request_with_authorization({
      endpoint: "coupon/apply",
      params: {
        code: code,
      },
      token: tokens.testOperator,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
  });
});
