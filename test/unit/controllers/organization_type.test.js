const helper = require("../../helper");
const { logger } = require("../../../logger");

describe("Organization Type Test Cases", () => {
  let tokens;
  let organizationTypeId;

  beforeAll(async () => {
    tokens = await helper.get_all_roles_tokens();
    const data = {
      params: {
        title: "bilaltesting",
      },
      token: tokens.superadmin,
      endpoint: "organization-types",
    };
    const response = await helper.post_request_with_authorization(data);
    organizationTypeId = response._body.data.id;
  });

  it("Success : getting all organization types", async () => {
    try {
      const data = {
        token: tokens.superadmin,
        endpoint: "organization-types",
      };

      const response = await helper.get_request_with_authorization(data);

      expect(response.status).toBe(200);
      expect(response._body.data.length).toBeGreaterThanOrEqual(0);
    } catch (error) {
      logger.error(error);
    }
  });

  it("success: add organization type successfully with super admin account", async () => {
    try {
      const data = {
        params: {
          title: "unittesting",
        },
        token: tokens.superadmin,
        endpoint: "organization-types",
      };

      const response = await helper.post_request_with_authorization(data);

      expect(response.status).toBe(200);
      expect(response._body.data.title).toBe(data.params.title);
    } catch (error) {
      logger.error(error);
    }
  });

  it("failure: cannot add duplicate organization type ", async () => {
    try {
      const data = {
        params: {
          title: "unittesting",
        },
        token: tokens.superadmin,
        endpoint: "organization-types",
      };

      const response = await helper.post_request_with_authorization(data);

      expect(response.status).toBe(400);
      expect(response._body.data).toStrictEqual(
        "Organization Type with title already exists",
      );
    } catch (error) {
      logger.error(error);
    }
  });

  it("success: getting organization type by id", async () => {
    try {
      const data = {
        token: tokens.superadmin,
        endpoint: `organization-types/${organizationTypeId}`,
      };

      const response = await helper.get_request_with_authorization(data);

      expect(response.status).toBe(200);
      expect(response._body.data.id).toBe(parseInt(`${organizationTypeId}`));
    } catch (error) {
      logger.error(error);
    }
  });

  it("failure: organization type doesnot exist with that id", async () => {
    try {
      const data = {
        token: tokens.superadmin,
        endpoint: "organization-types/null",
      };

      const response = await helper.get_request_with_authorization(data);

      expect(response.status).toBe(404);
      expect(response._body.data).toBe("Organization type not found");
    } catch (error) {
      logger.error(error);
    }
  });
});
