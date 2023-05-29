const helper = require("../../helper");

describe("organization creation", () => {
  let tokens;
  let organizationId;

  beforeAll(async () => {
    tokens = await helper.get_all_roles_tokens();
    const data = {
      params: {
        name: "pod4",
        email: "unittest@gmail.com",
      },
      token: tokens.superadmin,
      endpoint: "organization/add-organization",
    };
    const response = await helper.post_request_with_authorization(data);
    organizationId = response.body.data.orgId;
  });

  it("customer account can not add organization", async () => {
    const data = {
      params: {
        name: "Zong",
        email: "example@gmail.com",
      },
      token: tokens.testCustomer,
      endpoint: "organization/add-organization",
    };

    const response = await helper.post_request_with_authorization(data);

    expect(response.status).toBe(403);
    expect(response.body).toStrictEqual({
      success: false,
      data: "You are not allowed",
    });
  });

  it("Operator account can not add organization", async () => {
    const data = {
      params: {
        name: "Zong",
        email: "example@gmail.com",
      },
      token: tokens.testOperator,
      endpoint: "organization/add-organization",
    };

    const response = await helper.post_request_with_authorization(data);

    expect(response.status).toBe(403);
    expect(response.body).toStrictEqual({
      success: false,
      data: "You are not allowed",
    });
  });

  it("add organization failed as organization already exists", async () => {
    const data = {
      params: {
        name: "Zong",
        email: "example@gmail.com",
      },
      token: tokens.superadmin,
      endpoint: "organization/add-organization",
    };
    const response = await helper.post_request_with_authorization(data);
    expect(response.status).toBe(409);
    expect(response.body).toStrictEqual({
      success: false,
      data: "Organization already exists",
    });
  });

  it("add organization successfully with super admin account", async () => {
    const data = {
      params: {
        name: "Example",
        email: "test@gmail.com",
      },
      token: tokens.superadmin,
      endpoint: "organization/add-organization",
    };
    const response = await helper.post_request_with_authorization(data);
    expect(response.status).toBe(200);
    expect(response.body.data.message).toBe("User Invited successfully");
  });
  it("add organization successfully with admin account", async () => {
    const data = {
      params: {
        name: "Example2",
        email: "test2@gmail.com",
      },
      token: tokens.superadmin,
      endpoint: "organization/add-organization",
    };
    const response = await helper.post_request_with_authorization(data);
    expect(response.status).toBe(200);
    expect(response.body.data.message).toBe("User Invited successfully");
  });

  it("getting all organizations", async () => {
    const data = {
      token: tokens.superadmin,
      endpoint: "organization/getAllOrganizations",
    };
    const response = await helper.get_request_with_authorization(data);
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThanOrEqual(0);
  });

  it("getting organization by id", async () => {
    const data = {
      token: tokens.superadmin,
      endpoint: `organization/get/${organizationId}`,
    };
    const response = await helper.get_request_with_authorization(data);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(parseInt(`${organizationId}`));
  });

  it("organization doesnot exist with that id", async () => {
    const data = {
      token: tokens.superadmin,
      endpoint: "organization/get/null",
    };
    const response = await helper.get_request_with_authorization(data);
    expect(response.status).toBe(400);
    expect(response.body.data).toBe("No Organization Found");
  });
});
