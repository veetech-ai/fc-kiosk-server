const helper = require("../../../helper");
const jwt = require("jsonwebtoken");

describe("PUT: /user/{userId}", () => {
  let golferToken;
  let superAdminToken;
  let superAdmin;
  let adminToken;
  let admin;
  const makeUpdateUserApiRequest = async (params, token, id) => {
    const request = {
      params,
      token,
      endpoint: `user/${id}`,
    };
    return await helper.put_request_with_authorization(request);
  };
  beforeAll(async () => {
    golferToken = await helper.get_token_for("golfer");
    superAdminToken = await helper.get_token_for();
    superAdmin = jwt.decode(superAdminToken);
    adminToken = await helper.get_token_for("admin");
    admin = jwt.decode(adminToken);
  });

  afterAll(async () => {
    await makeUpdateUserApiRequest(
      {
        status: 1,
      },
      superAdminToken,
      admin.id,
    );
  });
  it("Super Admin cannot inactive himself", async () => {
    const apiRequestResponse = await makeUpdateUserApiRequest(
      {
        status: 1,
      },
      superAdminToken,
      superAdmin.id,
    );

    const expectedResponse = "You can not inactive yourself";

    expect(apiRequestResponse.body.data).toEqual(expectedResponse);
    expect(apiRequestResponse.status).toBe(400);
  });

  it("Golfer cannot inactive", async () => {
    const apiRequestResponse = await makeUpdateUserApiRequest(
      {
        status: "1",
      },
      golferToken,
      superAdmin.id,
    );

    const expectedResponse = "You are not allowed";

    expect(apiRequestResponse.body.data).toEqual(expectedResponse);
    expect(apiRequestResponse.status).toBe(403);
  });

  it("Super Admin can inactive other users", async () => {
    await makeUpdateUserApiRequest(
      {
        status: 1,
      },
      superAdminToken,
      admin.id,
    );

    const apiRequestResponse = await makeUpdateUserApiRequest(
      {
        status: 0,
      },
      superAdminToken,
      admin.id,
    );

    const expectedResponse = "User Updated Successfully";

    expect(apiRequestResponse.body.data).toEqual(expectedResponse);
    expect(apiRequestResponse.status).toBe(200);
  });

  it("Super Admin can active other users", async () => {
    await makeUpdateUserApiRequest(
      {
        status: 0,
      },
      superAdminToken,
      admin.id,
    );

    const apiRequestResponse = await makeUpdateUserApiRequest(
      {
        status: 1,
      },
      superAdminToken,
      admin.id,
    );

    const expectedResponse = "User Updated Successfully";

    expect(apiRequestResponse.body.data).toEqual(expectedResponse);
    expect(apiRequestResponse.status).toBe(200);
  });
});
