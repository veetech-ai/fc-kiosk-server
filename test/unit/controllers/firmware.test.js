const helper = require("../../helper");
const app_helper = require("../../../common/helper");

let tokens, new_firmware;
const ver = `v0.1.${app_helper.generate_random_string({
  length: 3,
  type: "numeric",
})}`;
const hw_ver = `v2.0.${app_helper.generate_random_string({
  length: 3,
  type: "numeric",
})}`;

beforeAll(async () => {
  tokens = await helper.get_all_roles_tokens();
});

describe("/firmware/create", () => {
  // create firmware
  it("Without access token", async () => {
    const res = await helper.post_request({
      endpoint: "firmware/create",
      params: {},
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

  it("With invalid access token", async () => {
    const res = await helper.post_request_with_authorization({
      endpoint: "firmware/create",
      params: {},
      fileupload: 1,
      token: "invalid token",
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

  it("With non admin or super admin user access token", async () => {
    const res = await helper.post_request_with_authorization({
      endpoint: "firmware/create",
      params: {},
      fileupload: 1,
      token: tokens.testOperator,
    });
    expect(res.statusCode).toEqual(403);
    expect(res.body.success).toEqual(false);
  });

  it("Without required params", async () => {
    const res = await helper.post_request_with_authorization({
      endpoint: "firmware/create",
      params: {},
      fileupload: 1,
      token: tokens.superadmin,
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toEqual(false);
  });

  it("Without some of required params", async () => {
    const res = await helper.post_request_with_authorization({
      endpoint: "firmware/create",
      params: {
        name: "test firmware",
        file_key: "file",
        file_path: "test.bin",
      },
      fileupload: 1,
      token: tokens.superadmin,
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toEqual(false);
  });

  it("With required params", async () => {
    const res = await helper.post_request_with_authorization({
      endpoint: "firmware/create",
      params: {
        name: "test firmware",
        ver: ver,
        hw_ver: hw_ver,

        file_key: "file",
        file_path: "test.bin",
      },
      fileupload: 1,
      token: tokens.superadmin,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.data).toHaveProperty("id");

    new_firmware = res.body.data;
  });

  it("Already exists coupon", async () => {
    const res = await helper.post_request_with_authorization({
      endpoint: "firmware/create",
      params: {
        name: "test firmware",
        ver: ver,
        hw_ver: hw_ver,

        file_key: "file",
        file_path: "test.bin",
      },
      fileupload: 1,
      token: tokens.superadmin,
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toEqual(false);
    expect(res.body.data).toBe("Firmware already exists");
  });
});

describe("/firmware/all", () => {
  // firmware
  it("Get all without token", async () => {
    const res = await helper.get_request({
      endpoint: "firmware/all",
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

  it("Get all with token of non admin user", async () => {
    const res = await helper.get_request_with_authorization({
      endpoint: "firmware/all",
      token: tokens.testOperator,
    });

    expect(res.statusCode).toEqual(403);
    expect(res.body.success).toEqual(false);
  });

  it("Get all", async () => {
    const res = await helper.get_request_with_authorization({
      endpoint: "firmware/all",
      token: tokens.superadmin,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
  });

  it("Get all with pagination", async () => {
    const res = await helper.get_request_with_authorization({
      endpoint: "firmware/all?limit=10&page=1",
      token: tokens.superadmin,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
  });
});

describe("/firmware/get/{id}", () => {
  // get single firmware by ID
  it("Get without token", async () => {
    const res = await helper.get_request({
      endpoint: `firmware/get/${new_firmware.id}`,
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

  it("Get with token of non admin user", async () => {
    const res = await helper.get_request_with_authorization({
      endpoint: `firmware/get/${new_firmware.id}`,
      token: tokens.testOperator,
    });

    expect(res.statusCode).toEqual(403);
    expect(res.body.success).toEqual(false);
  });

  it("Get by invalid ID", async () => {
    const res = await helper.get_request_with_authorization({
      endpoint: "firmware/get/invalid_id",
      token: tokens.superadmin,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.data).toBeNull();
  });

  it("Get by valid ID", async () => {
    const res = await helper.get_request_with_authorization({
      endpoint: `firmware/get/${new_firmware.id}`,
      token: tokens.superadmin,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.data).toHaveProperty("id", new_firmware.id);
    expect(res.body.data).toHaveProperty("ver", new_firmware.ver);
    expect(res.body.data).toHaveProperty("hw_ver", new_firmware.hw_ver);
  });
});

describe("/firmware/get-by-ver/{ver}", () => {
  // get single firmware by ver
  it("Get without token", async () => {
    const res = await helper.get_request({
      endpoint: `firmware/get-by-ver/${new_firmware.ver}`,
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

  it("Get with token of non admin user", async () => {
    const res = await helper.get_request_with_authorization({
      endpoint: `firmware/get-by-ver/${new_firmware.ver}`,
      token: tokens.testOperator,
    });

    expect(res.statusCode).toEqual(403);
    expect(res.body.success).toEqual(false);
  });

  it("Get by invalid ver", async () => {
    const res = await helper.get_request_with_authorization({
      endpoint: "firmware/get-by-ver/invalid_ver",
      token: tokens.superadmin,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.data).toBeNull();
  });

  it("Get by valid ver", async () => {
    const res = await helper.get_request_with_authorization({
      endpoint: `firmware/get-by-ver/${new_firmware.ver}`,
      token: tokens.superadmin,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.data).toHaveProperty("id", new_firmware.id);
    expect(res.body.data).toHaveProperty("ver", new_firmware.ver);
    expect(res.body.data).toHaveProperty("hw_ver", new_firmware.hw_ver);
  });
});

describe("/firmware/update/{firmwareId}", () => {
  // Update firmware
  it("Without access token", async () => {
    const res = await helper.put_request({
      endpoint: `firmware/update/${new_firmware.id}`,
      params: {},
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

  it("With invalid access token", async () => {
    const res = await helper.put_request_with_authorization({
      endpoint: `firmware/update/${new_firmware.id}`,
      params: {},
      fileupload: 1,
      token: "invalid token",
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

  it("With non admin or super admin user access token", async () => {
    const res = await helper.put_request_with_authorization({
      endpoint: `firmware/update/${new_firmware.id}`,
      params: {},
      fileupload: 1,
      token: tokens.testOperator,
    });

    expect(res.statusCode).toEqual(403);
    expect(res.body.success).toEqual(false);
  });

  it("Without required params", async () => {
    const res = await helper.put_request_with_authorization({
      endpoint: `firmware/update/${new_firmware.id}`,
      params: {},
      fileupload: 1,
      token: tokens.superadmin,
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toEqual(false);
  });

  it("Without some of required params", async () => {
    const res = await helper.put_request_with_authorization({
      endpoint: `firmware/update/${new_firmware.id}`,
      params: {
        name: "test firmware",
        file_key: "file",
        file_path: "test.bin",
      },
      fileupload: 1,
      token: tokens.superadmin,
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toEqual(false);
  });

  it("With required params", async () => {
    const res = await helper.put_request_with_authorization({
      endpoint: `firmware/update/${new_firmware.id}`,
      params: {
        name: "test firmware updated",
        ver: ver,
        hw_ver: hw_ver,

        file_key: "file",
        file_path: "test.bin",
      },
      fileupload: 1,
      token: tokens.superadmin,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.data).toHaveProperty("id");

    new_firmware = res.body.data;
  });
});

describe("/firmware/delete/{firmwareId}", () => {
  // delete firmware
  it("Without access token", async () => {
    const res = await helper.delete_request({
      endpoint: `firmware/delete/${new_firmware.id}`,
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

  it("With invalid access token", async () => {
    const res = await helper.delete_request_with_authorization({
      endpoint: `firmware/delete/${new_firmware.id}`,
      token: "invalid token",
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

  it("With non admin or super admin user access token", async () => {
    const res = await helper.delete_request_with_authorization({
      endpoint: `firmware/delete/${new_firmware.id}`,
      token: tokens.testOperator,
    });

    expect(res.statusCode).toEqual(403);
    expect(res.body.success).toEqual(false);
  });

  it("With superadmin token", async () => {
    const res = await helper.delete_request_with_authorization({
      endpoint: `firmware/delete/${new_firmware.id}`,
      token: tokens.superadmin,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
  });
});

describe("/firmware/v0-logs/{fv}", () => {
  // get firmware V0 logs
  it("Get without token", async () => {
    const res = await helper.get_request({
      endpoint: `firmware/v0-logs/${new_firmware.ver}`,
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

  it("Get with token of non admin user", async () => {
    const res = await helper.get_request_with_authorization({
      endpoint: `firmware/v0-logs/${new_firmware.ver}`,
      token: tokens.testOperator,
    });

    expect(res.statusCode).toEqual(403);
    expect(res.body.success).toEqual(false);
  });

  it("Get by invalid FV", async () => {
    const res = await helper.get_request_with_authorization({
      endpoint: "firmware/v0-logs/invalid_ver",
      token: tokens.superadmin,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.data).toHaveProperty("logs", []);
  });

  it("Get by valid FV", async () => {
    const res = await helper.get_request_with_authorization({
      endpoint: `firmware/v0-logs/${new_firmware.ver}`,
      token: tokens.superadmin,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
  });
});

describe("/firmware/vp-logs/{fv}", () => {
  // get firmware VP logs
  it("Get without token", async () => {
    const res = await helper.get_request({
      endpoint: `firmware/vp-logs/${new_firmware.ver}`,
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

  it("Get with token of non admin user", async () => {
    const res = await helper.get_request_with_authorization({
      endpoint: `firmware/vp-logs/${new_firmware.ver}`,
      token: tokens.testOperator,
    });

    expect(res.statusCode).toEqual(403);
    expect(res.body.success).toEqual(false);
  });

  it("Get by invalid FV", async () => {
    const res = await helper.get_request_with_authorization({
      endpoint: "firmware/vp-logs/invalid_ver",
      token: tokens.superadmin,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.data).toHaveProperty("logs", []);
  });

  it("Get by valid FV", async () => {
    const res = await helper.get_request_with_authorization({
      endpoint: `firmware/vp-logs/${new_firmware.ver}`,
      token: tokens.superadmin,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
  });
});

describe("/firmware/update-count", () => {
  // create firmware
  it("Without access token", async () => {
    const res = await helper.post_request({
      endpoint: "firmware/update-count",
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

  it("With invalid access token", async () => {
    const res = await helper.post_request_with_authorization({
      endpoint: "firmware/update-count",
      token: "invalid token",
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

  it("With non admin or super admin user access token", async () => {
    const res = await helper.post_request_with_authorization({
      endpoint: "firmware/update-count",
      token: tokens.testOperator,
    });

    expect(res.statusCode).toEqual(403);
    expect(res.body.success).toEqual(false);
  });

  it("With success", async () => {
    const res = await helper.post_request_with_authorization({
      endpoint: "firmware/update-count",
      token: tokens.superadmin,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
  });
});
